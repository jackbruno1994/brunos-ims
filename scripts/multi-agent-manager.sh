#!/bin/bash

# Multi-Agent Deployment Manager
# Helper script to manage and monitor multi-agent parallel deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONFIG_FILE=".github/multi-agent-config.yml"
WORKFLOW_FILE=".github/workflows/multi-agent-deploy.yml"

# Print header
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║        Multi-Agent Parallel Deployment Manager            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Print info message
info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

# Print warning message
warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Print error message
error() {
    echo -e "${RED}✗${NC} $1"
}

# Print success message
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Show status
show_status() {
    print_header
    info "Multi-Agent Deployment System Status"
    echo ""
    
    # Check if workflow exists
    if [ -f "$WORKFLOW_FILE" ]; then
        success "Workflow file exists: $WORKFLOW_FILE"
    else
        error "Workflow file not found: $WORKFLOW_FILE"
        return 1
    fi
    
    # Check if config exists
    if [ -f "$CONFIG_FILE" ]; then
        success "Configuration file exists: $CONFIG_FILE"
    else
        warn "Configuration file not found: $CONFIG_FILE"
    fi
    
    echo ""
    info "Configuration Summary:"
    if command -v python3 &> /dev/null; then
        python3 << 'EOF'
import yaml
import os

try:
    with open('.github/multi-agent-config.yml', 'r') as f:
        config = yaml.safe_load(f)
    
    print(f"  • Default Agents: {config['scaling']['default_agents']}")
    print(f"  • Max Parallel per Priority: {config['scaling']['max_parallel_per_priority']}")
    print(f"  • Max Total Agents: {config['scaling']['max_total_agents']}")
    print(f"  • Priority Levels: {len(config['priorities'])}")
    print(f"  • Total Tasks Defined: {len(config['tasks'])}")
except Exception as e:
    print(f"  Could not parse configuration: {e}")
EOF
    else
        warn "Python3 not found - cannot parse YAML configuration"
    fi
    
    echo ""
}

# Show task list
show_tasks() {
    print_header
    info "Available Tasks"
    echo ""
    
    if command -v python3 &> /dev/null; then
        python3 << 'EOF'
import yaml

try:
    with open('.github/multi-agent-config.yml', 'r') as f:
        config = yaml.safe_load(f)
    
    tasks = config['tasks']
    
    # Group by priority
    priorities = {}
    for task_name, task_info in tasks.items():
        priority = task_info.get('priority', 0)
        if priority not in priorities:
            priorities[priority] = []
        priorities[priority].append({
            'name': task_name,
            'module': task_info.get('module', 'unknown'),
            'command': task_info.get('command', ''),
            'timeout': task_info.get('timeout', 0),
            'description': task_info.get('description', '')
        })
    
    for priority in sorted(priorities.keys()):
        print(f"\n📋 Priority {priority} Tasks:")
        print("─" * 70)
        for task in priorities[priority]:
            print(f"  • {task['name']}")
            print(f"    Module: {task['module']}")
            print(f"    Command: {task['command']}")
            print(f"    Timeout: {task['timeout']} min")
            print(f"    Description: {task['description']}")
            print()
            
except Exception as e:
    print(f"Error parsing tasks: {e}")
EOF
    else
        warn "Python3 not found - cannot display tasks"
    fi
}

# Validate configuration
validate_config() {
    print_header
    info "Validating Configuration"
    echo ""
    
    local has_errors=0
    
    # Check workflow file
    if [ ! -f "$WORKFLOW_FILE" ]; then
        error "Workflow file not found: $WORKFLOW_FILE"
        has_errors=1
    fi
    
    # Check config file
    if [ ! -f "$CONFIG_FILE" ]; then
        error "Configuration file not found: $CONFIG_FILE"
        has_errors=1
    fi
    
    # Validate YAML syntax
    if command -v python3 &> /dev/null; then
        info "Validating YAML syntax..."
        
        if python3 -c "import yaml; yaml.safe_load(open('$WORKFLOW_FILE'))" 2>/dev/null; then
            success "Workflow YAML is valid"
        else
            error "Workflow YAML has syntax errors"
            has_errors=1
        fi
        
        if python3 -c "import yaml; yaml.safe_load(open('$CONFIG_FILE'))" 2>/dev/null; then
            success "Configuration YAML is valid"
        else
            error "Configuration YAML has syntax errors"
            has_errors=1
        fi
    else
        warn "Python3 not found - skipping YAML validation"
    fi
    
    echo ""
    if [ $has_errors -eq 0 ]; then
        success "All validations passed!"
        return 0
    else
        error "Validation failed with errors"
        return 1
    fi
}

# Simulate deployment
simulate_deployment() {
    local agent_count=${1:-10}
    
    print_header
    info "Simulating Multi-Agent Deployment with $agent_count agents"
    echo ""
    
    if command -v python3 &> /dev/null; then
        python3 << EOF
import yaml
import time
import random

try:
    with open('.github/multi-agent-config.yml', 'r') as f:
        config = yaml.safe_load(f)
    
    tasks = config['tasks']
    priorities = {}
    
    # Group tasks by priority
    for task_name, task_info in tasks.items():
        priority = task_info.get('priority', 0)
        if priority not in priorities:
            priorities[priority] = []
        priorities[priority].append({
            'name': task_name,
            'timeout': task_info.get('timeout', 5)
        })
    
    print("🚀 Starting deployment simulation...\n")
    
    total_time = 0
    
    # Setup phase
    print("📦 Setup Phase (Installing dependencies)...")
    setup_time = 5
    time.sleep(0.5)
    print(f"   Completed in {setup_time} minutes\n")
    total_time += setup_time
    
    # Execute each priority
    for priority in sorted(priorities.keys()):
        tasks_in_priority = priorities[priority]
        print(f"⚡ Priority {priority} - Executing {len(tasks_in_priority)} tasks in parallel")
        
        # Simulate parallel execution (max time of any task)
        max_time = max([t['timeout'] for t in tasks_in_priority])
        
        for task in tasks_in_priority:
            print(f"   🤖 Agent executing: {task['name']}")
            time.sleep(0.1)
        
        time.sleep(0.5)
        print(f"   ✅ All Priority {priority} tasks completed in {max_time} minutes\n")
        total_time += max_time
    
    # Final report
    print("📊 Generating final report...")
    time.sleep(0.3)
    print(f"\n{'═' * 60}")
    print("✨ Deployment Simulation Complete!")
    print(f"{'═' * 60}")
    print(f"Total agents deployed: $agent_count")
    print(f"Total execution time: {total_time} minutes")
    print(f"Tasks completed: {len(tasks)}")
    print(f"Average time per priority: {total_time / len(priorities):.1f} minutes")
    print(f"{'═' * 60}\n")
    
except Exception as e:
    print(f"Simulation error: {e}")
EOF
    else
        warn "Python3 not found - cannot run simulation"
    fi
}

# Show help
show_help() {
    print_header
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  status        Show multi-agent system status"
    echo "  tasks         List all available tasks"
    echo "  validate      Validate configuration files"
    echo "  simulate [N]  Simulate deployment with N agents (default: 10)"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status                 # Show system status"
    echo "  $0 tasks                  # List all tasks"
    echo "  $0 validate               # Validate configuration"
    echo "  $0 simulate 20            # Simulate with 20 agents"
    echo ""
}

# Main script logic
main() {
    case "${1:-help}" in
        status)
            show_status
            ;;
        tasks)
            show_tasks
            ;;
        validate)
            validate_config
            ;;
        simulate)
            simulate_deployment "${2:-10}"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
