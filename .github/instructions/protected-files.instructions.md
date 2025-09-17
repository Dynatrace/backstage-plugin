---
applyTo: "app-config.yaml,app-config.production.yaml,README.md,CONTRIBUTING.md,CODE_OF_CONDUCT.md,ADOPTERS.md,LICENSE"
---

# Protected Configuration and Documentation Files

## Scope
This instruction applies to configuration files and root-level documentation that should remain stable and unchanged during normal plugin development.

## Protected Files

### Configuration Files
- `app-config.yaml` - Development Backstage configuration
- `app-config.production.yaml` - Production Backstage configuration

### Root Documentation Files
- `README.md` - Main project documentation and setup instructions
- `CONTRIBUTING.md` - Contribution guidelines and development workflow
- `CODE_OF_CONDUCT.md` - Community standards and behavior guidelines
- `ADOPTERS.md` - List of organizations using the plugin
- `LICENSE` - Apache 2.0 license text

## ⚠️ Modification Policy

### ❌ DO NOT MODIFY unless explicitly requested
These files are **PROTECTED** and should not be altered during normal development tasks:

- **Configuration files** contain carefully tuned Backstage settings
- **Documentation files** are maintained by project maintainers
- **License file** is legally protected content

### ✅ When modifications ARE allowed
Only modify these files when:
- User **explicitly requests** changes to configuration or documentation
- User asks to "update the README" or "modify app-config"
- User provides specific content changes for these files
- User requests configuration changes for new features

## Configuration File Details

### `app-config.yaml`
- Development environment settings
- Local database and service configurations
- Plugin registration and routing
- Authentication providers (guest mode)

### `app-config.production.yaml`  
- Production deployment settings
- Environment variable references
- Database connection strings
- Security and CORS policies

## Documentation File Details

### `README.md`
- Project overview and plugin descriptions
- Installation and setup instructions
- Configuration examples
- Usage documentation

### `CONTRIBUTING.md`
- Development setup instructions
- Code style and testing guidelines
- Pull request process
- Release procedures

## Alternative Actions

Instead of modifying protected files, consider:
- Creating new configuration files for specific features
- Adding documentation to plugin-specific README files
- Updating comments in relevant source code files
- Creating separate configuration overlays or extensions