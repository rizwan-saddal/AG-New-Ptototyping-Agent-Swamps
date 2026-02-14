import { Badge, Button, Card, CardHeader, ProgressBar, Text, Title1 } from '@fluentui/react-components'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <Card className="panel">
        <CardHeader
          header={<Title1>Agent Swamps Command Dashboard</Title1>}
          description={<Text>Fluent UI 2 frontend ready for Cloud Run deployment.</Text>}
        />
        <div className="status-row">
          <Badge appearance="filled" color="brand">
            Frontend: Fluent UI 2
          </Badge>
          <Badge appearance="filled" color="success">
            Backend: .NET Agent Service
          </Badge>
        </div>
        <div className="workflow-row">
          <Text>Workflow initialization</Text>
          <ProgressBar value={0.72} thickness="large" />
        </div>
        <div className="actions-row">
          <Button appearance="primary">Open Neural Link</Button>
          <Button appearance="secondary">Launch Workflow</Button>
        </div>
      </Card>
    </main>
  )
}

export default App
