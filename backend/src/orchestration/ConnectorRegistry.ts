// Connector Registry - maps open-standard connectors (OpenAPI/JSON Schema/BPMN) for workflow canvas usage

import type { ConnectorDefinition } from '../shared/types.js';

export class ConnectorRegistry {
  private connectors: Map<string, ConnectorDefinition> = new Map();

  constructor() {
    this.registerDefaultConnectors();
  }

  list(): ConnectorDefinition[] {
    return Array.from(this.connectors.values());
  }

  get(id: string): ConnectorDefinition | undefined {
    return this.connectors.get(id);
  }

  register(connector: ConnectorDefinition): void {
    this.connectors.set(connector.id, connector);
  }

  private registerDefaultConnectors(): void {
    this.register({
      id: 'openapi-webhook',
      name: 'OpenAPI Webhook',
      description: 'Standard HTTP webhook contract using OpenAPI/JSON Schema payloads for inbound triggers.',
      standard: 'openapi',
      schemaRef: 'https://spec.openapis.org/oas/latest.html',
      auth: { type: 'apiKey', description: 'Supports header-based API keys' },
      inputs: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: {
          event: { type: 'string' },
          payload: { type: 'object' }
        },
        required: ['event', 'payload']
      },
      outputs: {
        status: { type: 'integer', enum: [200] },
        message: { type: 'string' }
      },
      example: {
        openapi: '3.1.0',
        paths: {
          '/webhooks/agent': {
            post: {
              summary: 'Agent Swamps trigger',
              requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Payload' } } } },
              responses: { '200': { description: 'accepted' } }
            }
          }
        }
      }
    });

    this.register({
      id: 'bpmn-workflow',
      name: 'BPMN Workflow Canvas',
      description: 'BPMN 2.0 compatible workflow definition export for visual canvas builders.',
      standard: 'bpmn',
      schemaRef: 'https://www.omg.org/spec/BPMN/2.0/',
      auth: { type: 'none' },
      inputs: {
        definition: 'BPMN 2.0 XML',
        nodes: 'WorkflowManagementSystem steps'
      },
      outputs: {
        diagram: 'Canvas-ready nodes/edges',
        metadata: 'Agent assignments and dependencies'
      }
    });

    this.register({
      id: 'jsonschema-dataset-contract',
      name: 'JSON Schema Dataset Contract',
      description: 'Dataset validation and contract enforcement using JSON Schema for AI/ML agents.',
      standard: 'jsonschema',
      schemaRef: 'https://json-schema.org/draft/2020-12/schema',
      auth: { type: 'none' },
      inputs: {
        dataset: { type: 'object' },
        schemaUri: { type: 'string' }
      },
      outputs: {
        validationReport: { type: 'object' },
        conformance: { type: 'boolean' }
      }
    });
  }
}
