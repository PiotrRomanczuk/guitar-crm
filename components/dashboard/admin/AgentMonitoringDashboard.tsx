/* eslint-disable max-lines, react/no-unescaped-entities */
/**
 * AI Agent Monitoring Dashboard Component
 *
 * Provides real-time monitoring and analytics for AI agent usage
 * across the Guitar CRM system. Only available to administrators.
 */

'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  BarChart3,
  Clock,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { agentRegistry, getAnalytics } from '@/lib/ai/agent-registry';

interface AgentStats {
  agentId: string;
  agentName: string;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  recentExecutions: any[];
  category: string;
}

export function AgentMonitoringDashboard() {
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAgentStats();
  }, []);

  const loadAgentStats = async () => {
    try {
      setLoading(true);

      // Get registered agents
      const registeredAgents = agentRegistry.getAgents();

      // Get analytics for each agent
      const stats: AgentStats[] = registeredAgents.map((agent) => {
        const analytics = getAnalytics(agent.id);

        return {
          agentId: agent.id,
          agentName: agent.name,
          totalExecutions: analytics.totalExecutions || 0,
          successRate: analytics.successRate || 1,
          averageExecutionTime: analytics.averageExecutionTime || 0,
          recentExecutions: analytics.recentExecutions || [],
          category: agent.uiConfig.category,
        };
      });

      setAgentStats(stats);
    } catch (error) {
      console.error('Failed to load agent stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    await loadAgentStats();
    setRefreshing(false);
  };

  const getTotalExecutions = () => {
    return agentStats.reduce((sum, agent) => sum + agent.totalExecutions, 0);
  };

  const getOverallSuccessRate = () => {
    const totalExecutions = getTotalExecutions();
    if (totalExecutions === 0) return 100;

    const totalSuccessful = agentStats.reduce(
      (sum, agent) => sum + agent.totalExecutions * agent.successRate,
      0
    );

    return (totalSuccessful / totalExecutions) * 100;
  };

  const getAverageExecutionTime = () => {
    const agentsWithExecutions = agentStats.filter((agent) => agent.totalExecutions > 0);
    if (agentsWithExecutions.length === 0) return 0;

    return (
      agentsWithExecutions.reduce((sum, agent) => sum + agent.averageExecutionTime, 0) /
      agentsWithExecutions.length
    );
  };

  const getCategoryStats = () => {
    const categories = agentStats.reduce((acc, agent) => {
      if (!acc[agent.category]) {
        acc[agent.category] = { executions: 0, agents: 0 };
      }
      acc[agent.category].executions += agent.totalExecutions;
      acc[agent.category].agents += 1;
      return acc;
    }, {} as Record<string, { executions: number; agents: number }>);

    return Object.entries(categories).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      ...data,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Loading Agent Monitoring...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            AI Agent Monitoring
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring and analytics for AI agent performance
          </p>
        </div>
        <Button
          onClick={refreshStats}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalExecutions().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {agentStats.length} agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOverallSuccessRate().toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall system reliability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageExecutionTime().toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">Average execution time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.length}</div>
            <p className="text-xs text-muted-foreground">Registered and active</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {agentStats.map((agent) => (
              <Card key={agent.agentId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{agent.agentName}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {agent.category}
                    </Badge>
                  </div>
                  <CardDescription>ID: {agent.agentId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Executions</p>
                      <p className="font-semibold">{agent.totalExecutions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <div className="flex items-center gap-2">
                        {agent.successRate >= 0.95 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : agent.successRate >= 0.8 ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-semibold">
                          {(agent.successRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Time</p>
                      <p className="font-semibold">{agent.averageExecutionTime.toFixed(0)}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCategoryStats().map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                  <CardDescription>{category.agents} agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{category.executions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total executions</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest agent executions across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agentStats
                  .flatMap((agent) =>
                    agent.recentExecutions.map((execution) => ({
                      ...execution,
                      agentName: agent.agentName,
                    }))
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.analytics.timestamp).getTime() -
                      new Date(a.analytics.timestamp).getTime()
                  )
                  .slice(0, 10)
                  .map((execution, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {execution.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{execution.agentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {execution.metadata.executionTime}ms
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(execution.analytics.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{execution.metadata.model}</p>
                      </div>
                    </div>
                  ))}

                {getTotalExecutions() === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity. Start using AI features to see analytics here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
