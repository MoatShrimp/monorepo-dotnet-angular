namespace Mono.AppHost.Infrastructure;

internal static class RepoPaths
{
  private const string REPO_ROOT_MARKER = "Directory.Build.props";

  public static string GetViteWebFrontendDir(this IDistributedApplicationBuilder builder)
  {
    var packageJsonFile = Path.Combine(builder.GetRepoRoot(), "apps", "web", "package.json");

    if (!File.Exists(packageJsonFile))
    {
      throw new FileNotFoundException($"""
        Vite app not found. If you moved the frontend, update RepoPaths.GetViteWebFrontendDir.
        Expected file: '{packageJsonFile}'
      """);
    }

    return Path.GetDirectoryName(packageJsonFile)!;
  }

  private static string GetRepoRoot(this IDistributedApplicationBuilder builder)
  {
    for (var dir = new DirectoryInfo(builder.AppHostDirectory); dir is not null; dir = dir.Parent)
    {
      if (File.Exists(Path.Combine(dir.FullName, REPO_ROOT_MARKER)))
      {
        return dir.FullName;
      }
    }

    throw new InvalidOperationException($"""
      Could not locate repo root starting from '{builder.AppHostDirectory}'.
      "Expected to find 'Directory.Build.props' in the repo root.
      """);
  }
}
