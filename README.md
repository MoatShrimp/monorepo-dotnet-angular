# Monorepo Lab: .NET + Angular + Aspire

This repository is a public "working lab" for how I prefer to build and operate a modern monorepo with .NET and Angular, using .NET Aspire as the local orchestrator. It is intentionally opinionated, with some patterns and constraints from my current professional environment.

It is not intended to be a generic template or a one-size-fits-all reference architecture. The goal is to be "as simple as possible, but not simpler" ie. avoid bloat and unnecessary complex solutions to simple problems, while still investing in the tooling and conventions that reduce friction while developing.

In practice, this repo is where I test ideas, validate assumptions, question conventions and make mistakes on purpose so I can learn from them.

## What you should expect

This repo prioritizes:

* A consistent, predictable structure for deployables and shared libraries.
* A single place to run common tasks and keep tooling aligned.
* Strong conventions over "whatever works" solutions.
* Local developer inner-loop speed and clarity.
* Maintainability and correctness (analyzers, formatting, explicit configuration), without drifting into over-engineering.

Because it’s a learning and experimentation space, conventions may evolve. Expect changes as I refine how I want a monorepo to feel and scale.

## High-level layout

The repository is organized around a small number of top-level folders:

* `apps/`
  Deployable applications (both .NET and Node)

* `libs/`
  Shared libraries (both .NET and Node)

* `infra/`
  Infrastructure-as-code and environment scaffolding

* `dev/`
  Development-only tooling (Aspire, scripts, helpers, repo automation, etc.).

* `docs/`
  Developer documentation

## Tooling philosophy

* **Node / frontend workspace:** Uses `pnpm` with a single workspace at the repo root
* **.NET workspace:** Uses an `slnx` solution setup plus build management through `Directory.Build.props` and dependency centralization via `Directory.Packages.props`
* **Editor experience:** `.vscode/` contains opinionated settings to standardize extensions and defaults, and to hide certain files to reduce mental overhead while navigating the repo

## Who this repo is for

* Developers who want to see one pragmatic way to organize a mixed .NET + Angular monorepo
* Anyone interested in .NET Aspire as a local orchestration tool
* People who value strong conventions and dev experience, but want to keep complexity under control

If you are looking for a "drop-in starter template", this may not be stable enough for that purpose. If you are looking for a real-world, evolving set of choices—and the reasoning behind them, you are in the right place.
