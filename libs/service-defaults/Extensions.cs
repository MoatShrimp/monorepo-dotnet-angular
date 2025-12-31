using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

#pragma warning disable IDE0130 // Use Microsoft.Extensions.Hosting namespace instead of folder structure
namespace Microsoft.Extensions.Hosting;

// Adds common Aspire services: service discovery, resilience, health checks, and OpenTelemetry.
// This project should be referenced by each service project in your solution.
// To learn more about using this project, see https://aka.ms/dotnet/aspire/service-defaults
public static class Extensions
{
  private const string HealthEndpointPath = "/health";
  private const string AlivenessEndpointPath = "/alive";

  public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
  {
    builder.ConfigureOpenTelemetry();
    builder.AddDefaultHealthChecks();
    builder.Services.AddServiceDiscovery();

    builder.Services.ConfigureHttpClientDefaults(http =>
    {
      http.AddStandardResilienceHandler();
      http.AddServiceDiscovery();
    });

    return builder;
  }

  public static TBuilder ConfigureOpenTelemetry<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
  {
    builder.Logging.AddOpenTelemetry(logging =>
    {
      logging.IncludeFormattedMessage = true;
      logging.IncludeScopes = true;
    });

    builder.Services.AddOpenTelemetry()
        .WithMetrics(metrics =>
        {
          metrics.AddAspNetCoreInstrumentation()
                  .AddHttpClientInstrumentation()
                  .AddRuntimeInstrumentation();
        })
        .WithTracing(tracing =>
        {
          tracing.AddSource(builder.Environment.ApplicationName)
                  .AddAspNetCoreInstrumentation(tracing =>
                      // Exclude health check requests from tracing
                      tracing.Filter = context =>
                          !context.Request.Path.StartsWithSegments(HealthEndpointPath)
                          && !context.Request.Path.StartsWithSegments(AlivenessEndpointPath)
                  )
                  .AddHttpClientInstrumentation();
        });

    builder.AddOpenTelemetryExporters();

    return builder;
  }

  private static TBuilder AddOpenTelemetryExporters<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
  {
    var useOtlpExporter = !string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

    if (useOtlpExporter)
    {
      builder.Services.AddOpenTelemetry()
                      .UseOtlpExporter();
    }

    return builder;
  }

  public static TBuilder AddDefaultHealthChecks<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
  {
    // Adding caching based on info from https://aka.ms/dotnet/aspire/healthchecks
    builder.Services.AddRequestTimeouts(
        configure: static timeouts =>
            timeouts.AddPolicy("HealthChecks", TimeSpan.FromSeconds(5)));

    builder.Services.AddOutputCache(
        configureOptions: static caching =>
            caching.AddPolicy("HealthChecks",
            build: static policy => policy.Expire(TimeSpan.FromSeconds(10))));

    builder.Services.AddHealthChecks()
        .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

    return builder;
  }

  public static WebApplication MapDefaultEndpoints(this WebApplication app)
  {
    var healthChecks = app.MapGroup("");

    healthChecks
        .CacheOutput("HealthChecks")
        .WithRequestTimeout("HealthChecks");


    healthChecks.MapHealthChecks(HealthEndpointPath);
    healthChecks.MapHealthChecks(AlivenessEndpointPath, new()
    {
      Predicate = r => r.Tags.Contains("live")
    });

    // Adding health checks endpoints to applications in non-development environments has security implications.
    // See https://aka.ms/dotnet/aspire/healthchecks for details before enabling these endpoints in non-development environments.
    if (app.Environment.IsProduction())
    {
      app.MapHealthChecks(HealthEndpointPath)
          .RequireHost("*:5001")
          .RequireAuthorization();
    }

    return app;
  }
}
