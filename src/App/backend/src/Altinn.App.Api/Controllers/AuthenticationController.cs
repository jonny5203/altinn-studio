using System.Runtime.Caching.Hosting;
using System.Web;
using Altinn.App.Core.Configuration;
using Altinn.App.Core.Constants;
using Altinn.App.Core.Internal.Auth;
using Altinn.App.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Altinn.App.Api.Controllers;

/// <summary>
/// Exposes API endpoints related to authentication.
/// </summary>
public class AuthenticationController : ControllerBase
{
    private readonly IAuthenticationClient _authenticationClient;
    private readonly GeneralSettings _settings;
    private readonly PlatformSettings _platformSettings;
    private readonly AppSettings _appSettings;
	private readonly IWebHostEnvironment _env;
    private readonly AppIdentifier _appId;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthenticationController"/> class
    /// </summary>
    public AuthenticationController(
        IAuthenticationClient authenticationClient,
        IOptions<GeneralSettings> settings,
        IOptions<PlatformSettings> platformSettings,
        IOptions<AppSettings> appSettings,
		IWebHostEnvironment env,
        AppIdentifier appId
    )
    {
        _authenticationClient = authenticationClient;
        _settings = settings.Value;
        _platformSettings = platformSettings.Value;
        _appSettings = appSettings.Value;
		_env = env;
        _appId = appId;
    }

    /// <summary>
    /// Refreshes the AltinnStudioRuntime JwtToken when not in AltinnStudio mode. It also return
    /// a redirect url when
    /// </summary>
    /// <returns>Ok result with updated token.</returns>
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize]
    [HttpGet("{org}/{app}/api/[controller]/keepAlive")]
    public async Task<IActionResult> KeepAlive()
    {
        string token = await _authenticationClient.RefreshToken();

        CookieOptions runtimeCookieSetting = new CookieOptions
        {
            Domain = _settings.HostName,
            HttpOnly = true,
            Secure = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
        };

        if (!string.IsNullOrWhiteSpace(token))
        {
            HttpContext.Response.Cookies.Append(General.RuntimeCookieName, token, runtimeCookieSetting);
            return Ok();
        }

		string scheme = _env.IsDevelopment() ? "http" : "https";
		string goToUrl = HttpUtility.UrlEncode($"{scheme}://{Request.Host}/{_appId.Org}/{_appId.App}");
        string redirectUrl = $"{_platformSettings.ApiAuthenticationEndpoint}authentication?goto={goToUrl}";
        if (!string.IsNullOrWhiteSpace(_appSettings.AppOidcProvider))
        {
            redirectUrl += "&iss=" + _appSettings.AppOidcProvider;
        }
        return BadRequest(new { redirectUrl = redirectUrl });
    }

    /// <summary>
    /// Invalidates the AltinnStudioRuntime cookie.
    /// </summary>
    /// <returns>Ok result with invalidated cookie.</returns>
    [ProducesResponseType(StatusCodes.Status200OK)]
    [Authorize]
    [HttpPut("{org}/{app}/api/[controller]/invalidatecookie")]
    public IActionResult InvalidateCookie()
    {
        HttpContext.Response.Cookies.Delete(
            General.RuntimeCookieName,
            new CookieOptions { Domain = _settings.HostName }
        );
        return Ok();
    }
}
