# Multi-Agent Deployment Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### What is it?

A system that deploys your code using **multiple agents working in parallel** instead of running tasks sequentially. Think of it as having a team of 1000 workers instead of just one!

### Key Concept

```
Traditional:  Task1 → Task2 → Task3 → Task4 → Task5  (Slow! 60 mins)
Multi-Agent:  [Task1, Task2, Task3, Task4, Task5]    (Fast! 15 mins)
```

## Quick Usage

### Automatic (Recommended)

The workflow runs automatically on every push to `main` or `develop`:

```bash
git add .
git commit -m "your changes"
git push origin main
```

GitHub Actions will automatically:

1. 🎯 Leader assigns tasks
2. 🤖 10 agents execute in parallel
3. 📊 Generate final report

### Manual Trigger

Want to control the number of agents?

1. Go to **GitHub Actions** tab
2. Select **"Multi-Agent Parallel Deployment"**
3. Click **"Run workflow"**
4. Enter agent count (e.g., `20`)
5. Click **"Run workflow"**

## Architecture in 30 Seconds

```
                    LEADER
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    [Agent 1]    [Agent 2]  ...  [Agent N]
    Priority 1   Priority 1      Priority 1
        ↓             ↓             ↓
    [Agent 1]    [Agent 2]  ...  [Agent N]
    Priority 2   Priority 2      Priority 2
        ↓             ↓             ↓
    [Agent 1]    [Agent 2]  ...  [Agent N]
    Priority 3   Priority 3      Priority 3
        ↓             ↓             ↓
                    REPORT
```

## What Gets Executed?

### Priority 1: Quality Checks (⚡ Fast)

- Linting (backend + frontend)
- Type checking (backend + frontend)
- Format checking

**All run at the same time!**

### Priority 2: Tests (🧪 Medium)

- Backend unit tests
- Frontend unit tests
- Security audit

**All run in parallel after Priority 1**

### Priority 3: Builds (🏗️ Slow)

- Backend build
- Frontend build

**Both builds run simultaneously**

## Management Script

Quick commands:

```bash
# Show system status
./scripts/multi-agent-manager.sh status

# List all tasks
./scripts/multi-agent-manager.sh tasks

# Validate configuration
./scripts/multi-agent-manager.sh validate

# Simulate deployment with 20 agents
./scripts/multi-agent-manager.sh simulate 20
```

## Configuration

### Change Number of Agents

Edit `.github/multi-agent-config.yml`:

```yaml
scaling:
  default_agents: 20 # Change from 10 to 20
```

### Add New Tasks

Edit `.github/multi-agent-config.yml`:

```yaml
tasks:
  my-new-task:
    module: 'backend'
    command: 'npm run my-task'
    timeout: 10
    priority: 1
    description: 'My custom task'
```

Then update `.github/workflows/multi-agent-deploy.yml` task matrix.

### Change Priorities

Tasks with lower priority numbers run first:

- Priority 1 = Runs first
- Priority 2 = Runs second
- Priority 3 = Runs last

## Benefits Summary

| Feature          | Traditional | Multi-Agent | Improvement  |
| ---------------- | ----------- | ----------- | ------------ |
| **Time**         | 60 min      | 15 min      | 4x faster    |
| **Parallelism**  | Sequential  | Parallel    | ∞ agents     |
| **Scalability**  | Fixed       | Dynamic     | Up to 1000+  |
| **Coordination** | Manual      | Automatic   | Leader-based |

## Monitoring

### View Progress

1. Go to **Actions** tab in GitHub
2. Click on your workflow run
3. See all agents working in parallel
4. View final report in summary

### Check Logs

Each agent has its own log:

- Click on any agent job
- View detailed execution logs
- Debug issues independently

## Troubleshooting

### Agents failing?

```bash
# Validate your configuration
./scripts/multi-agent-manager.sh validate
```

### Too slow?

```bash
# Increase agent count
# Go to Actions → Manual trigger → Set agent_count to 50
```

### Need to test locally?

```bash
# Simulate the deployment
./scripts/multi-agent-manager.sh simulate 20
```

## Best Practices

### DO ✅

- Keep tasks independent (can run in parallel)
- Set appropriate priorities
- Use shared dependency cache
- Monitor resource usage
- Test configuration before pushing

### DON'T ❌

- Make tasks depend on each other within same priority
- Set unrealistic timeouts
- Exceed runner capacity (>50 agents per priority)
- Modify running workflows
- Skip validation

## Next Steps

1. ✅ Read this quick start (you're here!)
2. 📖 Check [Full Documentation](./MULTI_AGENT_DEPLOYMENT.md)
3. 🧪 Test with `simulate` command
4. 🚀 Run your first deployment
5. 📊 Monitor and optimize

## Examples

### Example 1: Quick Deployment

```bash
git commit -m "fix: update component"
git push
# Automatically runs with 10 agents in parallel
```

### Example 2: Large Deployment

```yaml
# Manual trigger with 50 agents
agent_count: '50'
```

### Example 3: Custom Task

```yaml
# Add to multi-agent-config.yml
tasks:
  e2e-tests:
    module: 'root'
    command: 'npm run test:e2e'
    timeout: 30
    priority: 2
```

## Support

- 📖 [Full Documentation](MULTI_AGENT_DEPLOYMENT.md)
- 🔧 [Configuration Reference](../.github/multi-agent-config.yml)
- 🎬 [Workflow File](../.github/workflows/multi-agent-deploy.yml)
- 💬 [Open an Issue](https://github.com/jackbruno1994/brunos-ims/issues)

---

**Remember**: Deploy as much as you need! Let agents follow the same rules, work as a team, and have a leader keep assigning them tasks. If you have 1000 agents, they'll all work together! 🚀
