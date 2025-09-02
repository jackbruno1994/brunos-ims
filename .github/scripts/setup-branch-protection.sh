#!/bin/bash

# Branch Protection Rules Configuration Script
# This script sets up comprehensive branch protection rules for the repository
# Run this script to configure GitHub branch protection via GitHub CLI

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository information
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-jackbruno1994}"
REPO_NAME="${GITHUB_REPOSITORY_NAME:-brunos-ims}"
REPO="${REPO_OWNER}/${REPO_NAME}"

echo -e "${BLUE}🔒 Setting up Branch Protection Rules for ${REPO}${NC}"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed or not in PATH${NC}"
    echo "Please install GitHub CLI: https://cli.github.com/"
    exit 1
fi

# Check if authenticated with GitHub CLI
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo "Please run 'gh auth login' first"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is installed and authenticated${NC}"

# Function to create branch protection rule
create_branch_protection() {
    local branch=$1
    local rule_name=$2
    
    echo -e "${BLUE}📋 Setting up protection for ${branch} branch...${NC}"
    
    # Main branch protection (strictest)
    if [ "$branch" = "main" ]; then
        gh api repos/${REPO}/branches/${branch}/protection \
            --method PUT \
            --field required_status_checks='{"strict":true,"contexts":["CI/CD Pipeline","Enhanced Security Scanning","Code Quality & Performance Monitoring"]}' \
            --field enforce_admins=true \
            --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"require_last_push_approval":true}' \
            --field restrictions='{"users":[],"teams":[],"apps":[]}' \
            --field allow_force_pushes=false \
            --field allow_deletions=false \
            --field block_creations=false \
            --field required_conversation_resolution=true \
            --field lock_branch=false \
            --field allow_fork_syncing=true && \
        echo -e "${GREEN}✅ Main branch protection configured${NC}" || \
        echo -e "${RED}❌ Failed to configure main branch protection${NC}"
    
    # Develop branch protection (moderate)
    elif [ "$branch" = "develop" ]; then
        gh api repos/${REPO}/branches/${branch}/protection \
            --method PUT \
            --field required_status_checks='{"strict":true,"contexts":["CI/CD Pipeline","Code Quality & Performance Monitoring"]}' \
            --field enforce_admins=false \
            --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"require_last_push_approval":false}' \
            --field restrictions='{"users":[],"teams":[],"apps":[]}' \
            --field allow_force_pushes=false \
            --field allow_deletions=false \
            --field block_creations=false \
            --field required_conversation_resolution=true \
            --field lock_branch=false \
            --field allow_fork_syncing=true && \
        echo -e "${GREEN}✅ Develop branch protection configured${NC}" || \
        echo -e "${RED}❌ Failed to configure develop branch protection${NC}"
    fi
}

# Function to enable auto-merge
enable_auto_merge() {
    echo -e "${BLUE}🔄 Enabling auto-merge for repository...${NC}"
    
    gh api repos/${REPO} \
        --method PATCH \
        --field allow_auto_merge=true \
        --field allow_merge_commit=true \
        --field allow_squash_merge=true \
        --field allow_rebase_merge=false \
        --field delete_branch_on_merge=true \
        --field allow_update_branch=true && \
    echo -e "${GREEN}✅ Auto-merge enabled${NC}" || \
    echo -e "${RED}❌ Failed to enable auto-merge${NC}"
}

# Function to create CODEOWNERS file
create_codeowners() {
    echo -e "${BLUE}👥 Creating CODEOWNERS file...${NC}"
    
    cat > .github/CODEOWNERS <<EOF
# Global owners - these users/teams will be requested for review on all PRs
* @${REPO_OWNER}

# GitHub Actions and CI/CD workflows
/.github/ @${REPO_OWNER}
/.github/workflows/ @${REPO_OWNER}
/.github/copilot/ @${REPO_OWNER}

# Backend code
/backend/ @${REPO_OWNER}
/backend/src/ @${REPO_OWNER}
/backend/tests/ @${REPO_OWNER}

# Frontend code
/frontend/ @${REPO_OWNER}
/frontend/src/ @${REPO_OWNER}
/frontend/tests/ @${REPO_OWNER}

# Configuration files
package.json @${REPO_OWNER}
package-lock.json @${REPO_OWNER}
tsconfig.json @${REPO_OWNER}
.eslintrc.* @${REPO_OWNER}
.prettierrc @${REPO_OWNER}

# Security and dependency files
.github/dependabot.yml @${REPO_OWNER}
SECURITY.md @${REPO_OWNER}

# Documentation
README.md @${REPO_OWNER}
/docs/ @${REPO_OWNER}
COPILOT_IMPLEMENTATION.md @${REPO_OWNER}
EOF

    echo -e "${GREEN}✅ CODEOWNERS file created${NC}"
}

# Function to create issue and PR templates
create_templates() {
    echo -e "${BLUE}📝 Creating issue and PR templates...${NC}"
    
    # Create issue templates directory
    mkdir -p .github/ISSUE_TEMPLATE
    
    # Bug report template
    cat > .github/ISSUE_TEMPLATE/bug_report.yml <<EOF
name: 🐛 Bug Report
description: Report a bug or unexpected behavior
title: "[Bug]: "
labels: ["bug", "needs-triage"]
assignees: ["${REPO_OWNER}"]

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!

  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: A clear and concise description of what the bug is.
      placeholder: Tell us what you see!
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '....'
        3. Scroll down to '....'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      description: A clear and concise description of what you expected to happen.
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: |
        examples:
          - **OS**: Ubuntu 20.04
          - **Node**: 18.17.0
          - **Browser**: Chrome 114
      value: |
        - OS:
        - Node:
        - Browser:
    validations:
      required: true
EOF

    # Feature request template
    cat > .github/ISSUE_TEMPLATE/feature_request.yml <<EOF
name: 🚀 Feature Request
description: Suggest a new feature or enhancement
title: "[Feature]: "
labels: ["enhancement", "needs-triage"]
assignees: ["${REPO_OWNER}"]

body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a new feature!

  - type: textarea
    id: feature-description
    attributes:
      label: Feature Description
      description: A clear and concise description of the feature you'd like to see.
      placeholder: Describe the feature...
    validations:
      required: true

  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem does this feature solve?
      placeholder: This feature would solve...
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: How should this feature work?
      placeholder: The feature should work by...
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives
      description: Have you considered any alternative solutions?
      placeholder: Alternative approaches could be...
EOF

    # PR template
    cat > .github/pull_request_template.md <<EOF
## 📋 Description

Brief description of what this PR does.

## 🔗 Related Issue

Fixes #(issue number)

## 🧪 Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🧹 Code cleanup/refactoring

## ✅ Testing

- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Updated existing tests as needed
- [ ] Manual testing completed

## 📝 Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## 📷 Screenshots (if applicable)

<!-- Add screenshots here -->

## 📄 Additional Notes

<!-- Any additional notes, context, or considerations -->
EOF

    echo -e "${GREEN}✅ Issue and PR templates created${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting Branch Protection Configuration${NC}"
    echo ""
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Not in a Git repository${NC}"
        exit 1
    fi
    
    # Create supporting files
    create_codeowners
    create_templates
    
    echo ""
    echo -e "${GREEN}✅ Branch Protection Configuration Complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary of changes:${NC}"
    echo "  • CODEOWNERS file created"
    echo "  • Issue and PR templates created"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "  1. Review the created files and commit them"
    echo "  2. Run the script with GitHub CLI to configure branch protection"
    echo "  3. Verify branch protection rules in GitHub repository settings"
    echo ""
}

# Run main function
main "$@"