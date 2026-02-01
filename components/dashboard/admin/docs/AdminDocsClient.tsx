'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Book, Smartphone, Zap, Lock } from 'lucide-react';

export function AdminDocsClient() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Developer Documentation</h1>
        <p className="text-muted-foreground">
          Technical documentation and integration guides for Guitar CRM.
          <span className="ml-2 inline-flex items-center rounded-md bg-warning/10 px-2 py-1 text-xs font-medium text-warning ring-1 ring-inset ring-warning/20">
            Admin Only
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="flex flex-col p-2">
                  <Button
                    variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('overview')}
                  >
                    <Book className="mr-2 h-4 w-4" />
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === 'api' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('api')}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Authentication
                  </Button>
                  <Button
                    variant={activeTab === 'widgets' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('widgets')}
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    iOS Widgets
                  </Button>
                  <Button
                    variant={activeTab === 'future' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('future')}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Future Plans
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Guitar CRM Developer Docs</CardTitle>
                  <CardDescription>
                    This documentation is intended for administrators and developers working on
                    extending the Guitar CRM platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Here you will find information about:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Authenticating with the API using Bearer tokens and API Keys.</li>
                    <li>Creating external widgets (e.g., for iOS using Scriptable).</li>
                    <li>Upcoming features and architectural decisions.</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>
                    How to authenticate your requests to the Guitar CRM API.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Bearer Tokens</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      For short-lived sessions (e.g., testing in browser), you can use the session
                      token found on the dashboard. These tokens expire after 1 hour.
                    </p>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      Authorization: Bearer &lt;your-session-token&gt;
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      API Keys (Recommended for Scripts)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      For long-running scripts or external widgets, generate an API Key in the
                      Settings page. These keys do not expire until revoked.
                    </p>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      Authorization: Bearer gcrm_&lt;random-string&gt;
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="widgets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>iOS Widget Integration</CardTitle>
                  <CardDescription>
                    Guide for creating iOS widgets using Scriptable.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    You can use the <strong>Scriptable</strong> app on iOS to create custom widgets
                    that display data from Guitar CRM.
                  </p>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Step 1: Get an API Key</h3>
                    <p className="text-sm text-muted-foreground">
                      Go to Settings &gt; API Keys and create a new key named &quot;iPhone
                      Widget&quot;. Copy the key.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Step 2: Create Script</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a new script in Scriptable and use the following template:
                    </p>
                    <pre className="bg-background border border-border text-foreground p-4 rounded-md overflow-x-auto text-xs">
                      {`const API_URL = "https://your-app-url.com/api";
const API_KEY = "gcrm_YOUR_API_KEY_HERE";

let widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();

async function createWidget() {
  let w = new ListWidget();
  w.backgroundColor = new Color("#1a1a1a");

  // Fetch Data
  let req = new Request(API_URL + "/dashboard/stats");
  req.headers = { "Authorization": "Bearer " + API_KEY };
  let data = await req.loadJSON();

  // UI
  let title = w.addText("Guitar CRM");
  title.textColor = Color.orange();
  title.font = Font.boldSystemFont(16);
  
  w.addSpacer(8);
  
  let stats = w.addText("Students: " + data.totalStudents);
  stats.textColor = Color.white();
  
  return w;
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="future" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Future Implementation Plans</CardTitle>
                  <CardDescription>
                    Roadmap and technical specifications for upcoming features.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">1. Student Portal V2</h3>
                    <p className="text-sm text-muted-foreground">
                      Enhanced practice logs, video submissions, and gamification elements.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">2. Automated Billing</h3>
                    <p className="text-sm text-muted-foreground">
                      Stripe integration for automatic subscription billing and invoicing.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">3. Mobile App</h3>
                    <p className="text-sm text-muted-foreground">
                      Native React Native application using the same API endpoints documented here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
