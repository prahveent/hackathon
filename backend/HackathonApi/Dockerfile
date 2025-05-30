# Use the official .NET 9 runtime as a parent image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Use the official .NET 9 SDK as a build environment
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["HackathonApi.csproj", "."]
RUN dotnet restore "./HackathonApi.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "HackathonApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HackathonApi.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HackathonApi.dll"]
