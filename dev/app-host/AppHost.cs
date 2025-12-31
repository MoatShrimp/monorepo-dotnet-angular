using Mono.AppHost.Infrastructure;

var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.Mono_Api>("api")
    .WithHttpHealthCheck("/health");

builder.AddViteApp("webfrontend", builder.GetRepoRoot())
    .WithPnpm()
    .WithRunScript("start")
    .WithReference(apiService)
    .WaitFor(apiService);

builder.Build().Run();
