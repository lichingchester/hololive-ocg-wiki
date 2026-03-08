# Contributing to Hololive OCG Wiki

Thank you for your interest in contributing to the Hololive OCG Wiki project! This guide will help you understand how to contribute effectively to this fan-made wiki for the Hololive Official Card Game.

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/lichingchester/hololive-ocg-wiki/pulls)

## Table of Contents

- [Contributing to Hololive OCG Wiki](#contributing-to-hololive-ocg-wiki)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Setting Up the Development Environment](#setting-up-the-development-environment)
    - [Setting Up the Local D1 Database (Backend)](#setting-up-the-local-d1-database-backend)
  - [Development Workflow](#development-workflow)
    - [Branch Guidelines](#branch-guidelines)
    - [Commit Guidelines](#commit-guidelines)
    - [Pull Request Process](#pull-request-process)
  - [Translation Contributions \[WIP\]](#translation-contributions-wip)
  - [Data Contributions \[WIP\]](#data-contributions-wip)
  - [Code Style and Standards \[WIP\]](#code-style-and-standards-wip)
  - [Reporting Bugs](#reporting-bugs)
  - [Feature Requests](#feature-requests)
  - [Running Tests \[WIP\]](#running-tests-wip)
  - [Communication](#communication)
  - [Contact](#contact)

## Project Overview

Hololive OCG Wiki is a fan-made resource for the Hololive Official Card Game. The project is built with Nuxt.js and aims to provide comprehensive card information, deck building tools, and other resources for players.

## Getting Started

### Prerequisites

- Node.js (v22 or higher recommended)
- npm
- Git

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The site should now be running at `http://localhost:3000/hololive-ocg-wiki`

### Setting Up the Local D1 Database (Backend)

The card data is served from a Cloudflare D1 database via a Worker API. To run the backend locally:

1. Install cloudflare worker dependencies:
   ```bash
   cd cloudflare
   npm install
   ```
2. Generate migration SQL batches from the card data:
   ```bash
   node migrate.js
   ```
3. Run schema and migrations against the local D1 database:
   ```bash
   ./run-migration.sh --env local
   ```
   You can preview with `--dry-run` first, or resume from a specific batch with `--start <batch_number>`.
4. (Optional) Set up full-text search for faster queries:
   ```bash
   ./setup-fts.sh --local hololive-ocg-db
   ```
5. Start the local Worker API server:
   ```bash
   npx wrangler dev
   ```
   The API will be available at `http://localhost:8787`. Test it with:
   ```bash
   curl "http://localhost:8787/api/cards/filter?locale=en&limit=5"
   ```
6. In a separate terminal, start the Nuxt frontend from the project root:
   ```bash
   cd ..
   npm run dev
   ```

#### Useful Database Commands

| Task                          | Command                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Query local DB                | `npx wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards;"` |
| Re-apply schema only          | `npx wrangler d1 execute hololive-ocg-db --local --file=./schema.sql`                     |
| Resume migration from batch N | `./run-migration.sh --env local --start N`                                                |
| View worker logs              | `npx wrangler tail`                                                                       |

The local D1 data is persisted in `cloudflare/.wrangler/state/` and survives restarts.

## Development Workflow

### Branch Guidelines

- `main` - Production-ready code
- `develop` - Development branch for new features
- Content branches - Create from `develop` with naming convention: `content/content-description`
- Feature branches - Create from `develop` with naming convention: `feature/feature-name`
- Bug fix branches - Create from `develop` with naming convention: `fix/bug-description`

### Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or modifying tests
- `content:` - The translation content updates

### Pull Request Process

1. Ensure your code adheres to the project's code style and standards
2. Update documentation as necessary
3. Make sure all tests pass
4. Submit a pull request to the `develop` branch
5. Request reviews from maintainers
6. Address any feedback from reviewers
7. Once approved, your PR will be merged by a maintainer

## Translation Contributions [WIP]

Translations are a critical part of this project. When contributing translations:

1. For card data translations, update the `data/cards_i18n.json` file
2. For UI and general content translations, update the appropriate locale file in `i18n/locales/{locale}.json`
3. **Important Note**: When updating translations in `cards_i18n.json`, ensure all translated content is included in this file as it serves as the main source for all translations

The structure for translations should match the existing pattern in the files. For example:

```json
// In data/cards_i18n.json
{
  "cardId": {
    "en": {
      "name": "English card name",
      "effect": "English card effect"
    },
    "ja": {
      "name": "Japanese card name",
      "effect": "Japanese card effect"
    },
    "tc": {
      "name": "Traditional Chinese card name",
      "effect": "Traditional Chinese card effect"
    }
  }
}

// In i18n/locales/{locale}.json
{
  "common": {
    "search": "Search text in target language",
    "filter": "Filter text in target language"
  }
}
```

## Data Contributions [WIP]

When contributing new card data or updating existing data:

1. For grabbing new card data, use the notebooks in the `data-grab-scripts` directory
2. Follow the process outlined in `data-grab-scripts/README.md`
3. When making significant data updates, create a backup of the current data in `data-grab-scripts/data_backup/` with a date-based filename
4. Ensure all data conforms to the TypeScript types defined in `types/card.ts`

**Note about grabbing scripts**: The data processing scripts in the `data-grab-scripts` directory are provided as tools to help with data extraction and transformation. While they may not have comprehensive documentation or a well-defined flow description, they are open for everyone to use. Contributors are encouraged to explore and understand the code to make effective use of these tools. Feel free to improve the documentation for these scripts as part of your contributions.

## Code Style and Standards [WIP]

- We use ESLint for code linting
- Follow the existing code patterns for components, composables, and other files
- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Use the provided `.vscode` folder settings for consistent development experience
  - This folder is committed to Git to ensure all contributors have the same settings
  - Please do not override these settings in your local environment or include personal settings in pull requests

## Reporting Bugs

When reporting bugs, please include:

1. A clear, descriptive title
2. Steps to reproduce the bug
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Browser and OS information

## Feature Requests

Feature requests are welcome! Please provide:

1. A clear, descriptive title
2. Detailed description of the proposed feature
3. Any relevant mockups or examples
4. Explanation of why this feature would be valuable to users

## Running Tests [WIP]

## Communication

We use GitHub's features to organize our project communication:

- **Discussions**: For general questions, ideas, and community conversations. Use this for non-bug related topics or when you're not sure where to start.
- **Issues**: For reporting bugs, problems, or suggesting well-defined feature requests. Please use the provided templates when available.
- **Pull Requests**: For submitting code changes. Always link to related issues when applicable.

When participating in any form of communication, please follow our code of conduct and be respectful of other contributors.

## Contact

If you have questions about contributing, please [open an issue](https://github.com/lichingchester/hololive-ocg-wiki/issues) or start a [discussion](https://github.com/lichingchester/hololive-ocg-wiki/discussions).

Thank you for contributing to make the Hololive OCG Wiki better for everyone!
