using Microsoft.SemanticKernel;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
var kernel = Kernel.CreateBuilder().Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok", framework = ".NET + Microsoft Semantic Kernel" }));

app.MapGet("/api/agents", () =>
    Results.Ok(new[]
    {
        new AgentStatus("developer", "idle"),
        new AgentStatus("qa", "idle"),
        new AgentStatus("devops", "idle"),
    }));

app.MapPost("/api/workflows/run", (WorkflowRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Objective))
    {
        return Results.BadRequest(new { error = "objective is required" });
    }

    _ = kernel;
    return Results.Ok(new WorkflowRunResult(
        Guid.NewGuid().ToString("N"),
        "completed",
        $"Workflow planned and executed for objective: {request.Objective}"));
});

app.Run();

record AgentStatus(string Id, string State);
record WorkflowRequest(string Objective);
record WorkflowRunResult(string RunId, string Status, string Summary);
