# 3D Drawing Application - Architectural Overview

## Core Concepts

### 1. Two-Canvas System
The application employs a two-canvas architecture: - **Drawing Canvas**: Captures 2D input. - **Rendering Canvas**: Displays 3D visualizations. This separation ensures a clear distinction between user input and graphical output, enhancing performance and usability.

### 2. Data Flow

**`User Input → 2D Points → Shape Analysis → 3D Conversion → Multiplayer Sync`**

## Key Components

### 1. Drawing System
- **Point Capture**: - Tracks mouse movements to collect points as `Vector2` coordinates. - Provides real-time visual feedback on the 2D canvas.

- **Shape Analysis**: - Points are evaluated for: - Circularity (variance in radius) - Complexity (number of points) - Size (bounding box)

### 2. 3D Conversion Pipeline

#### Shape Detection Algorithm
1. Collect points during drawing. 2. Analyze point distribution. 3. Calculate variance from the center point. 4. Determine shape type: - If variance < threshold → Sphere - Else → Extrusion

#### Point Processing
1. **Simplification**: - Reduces the number of points while preserving the shape using distance-based tolerance. - Prevents performance issues with complex shapes.

2. **Normalization**: - Scales points to a consistent size and centers shapes in 3D space, ensuring uniformity regardless of the drawing size.

### 3. 3D Scene Management

#### Scene Setup
- **Camera**: Utilizes `ArcRotateCamera` for orbital viewing. - **Lighting**: - Hemispheric light for ambient illumination. - Directional light for shadows and depth. - **Ground**: Grid-based reference plane to provide context.

#### Shape Creation
Two primary approaches: 1. **Sphere Generation**: - For circular drawings, with size based on drawing bounds. - Provides a smooth, uniform appearance. 2. **Extrusion Creation**: - For non-circular shapes, creates a 3D volume from the 2D profile while maintaining drawn proportions.

### 4. Multiplayer Integration

#### Architecture

**`Client ←→ Colyseus Server ←→ Other Clients`**


#### Synchronization Events
1. **Shape Creation**: - Broadcasts new shapes to all clients, including shape data and position. 2. **Movement Updates**: - Real-time position synchronization optimized for network performance.

#### State Management
- **Local State**: - Immediate updates for responsiveness with predictive movements. - **Server State**: - Authoritative tracking of positions with conflict resolution.

## Technical Decisions

### 1. Framework Choice: Angular
- Strong typing support. - Component-based architecture. - Dependency injection for services. - Reactive programming capabilities.

### 2. Libraries
- **BabylonJS**: - A robust 3D engine with excellent TypeScript support and an active community, optimized for performance. - **Colyseus**: - Manages state synchronization, room-based multiplayer functionality, WebSocket management, and built-in security.

### 3. Performance Optimizations

#### Drawing Optimization
- Point simplification - Throttled updates - Efficient canvas rendering

#### 3D Rendering
- Mesh pooling - Material reuse - Scene graph optimization

#### Network Optimization
- Delta updates - Binary protocols - State interpolation

## User Experience Considerations

### 1. Drawing Interface
- Immediate visual feedback - Smooth line rendering - Clear canvas boundaries

### 2. 3D Visualization
- Intuitive camera controls - Clear shape differentiation - Visual ground reference

### 3. Movement Controls
- Cardinal direction buttons - Fixed movement increments - Visual position feedback

## Error Handling

### 1. Drawing Validation
- Minimum point threshold - Shape closure detection - Invalid input prevention

### 2. Network Resilience
- Connection loss handling - State reconciliation - Graceful degradation

### 3. Resource Management
- Canvas cleanup - Memory management - Scene disposal

## Future Enhancements

### 1. Potential Features
- Shape rotation - Scale manipulation - Texture mapping - Custom materials

### 2. Performance Improvements
- WebGL2 support - Worker thread processing - LOD implementation

### 3. Multiplayer Extensions
- Shape ownership - Collaborative editing - Persistent rooms

## Development Guidelines

### 1. Code Organization
- Feature-based modules - Clear service boundaries - Shared utilities - Type definitions

### 2. State Management
- Reactive patterns - Immutable updates - Clear state flow

### 3. Testing Strategy
- Unit tests for utilities - Component testing - E2E scenarios

