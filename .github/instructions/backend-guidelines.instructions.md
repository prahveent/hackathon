---
applyTo: "backend/**"
---

# Backend Guidelines

## .NET Web API Three-Layer Architecture

### Layer Structure

1. **Controller Layer** - All API endpoints
2. **BusinessService Layer** - All business logic
3. **Repository Layer** - All database logic

### When Creating New Features

#### 1. Controller Layer
- Add new endpoints to appropriate controller
- Keep controllers thin - only handle HTTP requests/responses
- Use dependency injection for services
- Return appropriate HTTP status codes

#### 2. BusinessService Layer
- Create service classes for business logic
- Validate input data
- Handle business rules and workflows
- Call repository methods for data access
- Return business objects/DTOs

#### 3. Repository Layer
- Create repository classes for database operations
- Handle all database queries and commands
- Use Entity Framework or ADO.NET
- Return data models/entities

### File Organization

Group by feature level for better organization:

```
Controllers/
├── ApiController.cs
├── UserController.cs
└── ProductController.cs

BusinessService/
├── User/
│   ├── IUserService.cs
│   ├── UserService.cs
│   ├── IUserRepository.cs
│   └── UserRepository.cs
└── Product/
    ├── IProductService.cs
    ├── ProductService.cs
    ├── IProductRepository.cs
    └── ProductRepository.cs
```

### Simple Workflow

1. **Add Controller endpoint** → calls Service
2. **Add Service method** → handles business logic → calls Repository
3. **Add Repository method** → handles database operations

### Naming Conventions

- Controllers: `[Entity]Controller.cs`
- Services: `[Entity]Service.cs` and `I[Entity]Service.cs`
- Repositories: `[Entity]Repository.cs` and `I[Entity]Repository.cs`

### Dependencies

- Controller depends on Service (not Repository)
- Service depends on Repository
- Repository depends on Database/DbContext
