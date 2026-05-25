# Custom 3D Car Models

This directory contains 3D car models for the AutoCare Companion guide visualizations.

## Supported Formats

- **GLTF** (.gltf) - Recommended, includes external textures
- **GLB** (.glb) - Binary GLTF, all assets bundled in one file

## Adding Your Custom Model

### Directory Structure

Create a folder for your vehicle model:

```
public/models/
├── challenger/           # Your vehicle folder
│   ├── model.glb        # Main model file (or model.gltf)
│   └── textures/        # If using GLTF with separate textures
│       ├── body.jpg
│       ├── interior.jpg
│       └── ...
├── civic/
│   └── model.glb
└── README.md
```

### Model Requirements

1. **Scale**: Models should be approximately real-world scale (1 unit = 1 meter)
   - Standard sedan: ~4.5m long, ~1.8m wide, ~1.4m tall
   - If your model is scaled differently, use `customModelScale` prop

2. **Orientation**:
   - Front of car should face +X axis
   - Top of car should face +Y axis
   - Use `customModelRotation` prop if needed

3. **Origin**: Center the model at origin (0, 0, 0)
   - Use `customModelPosition` to adjust if needed

### Using Your Model

In the guide page component:

```tsx
<StepSync3DViewer
  // ... other props
  customModelPath="/models/challenger/model.glb"
  customModelScale={1}
  customModelPosition={[0, 0, 0]}
  customModelRotation={[0, 0, 0]}
/>
```

### Optimization Tips

1. **File Size**: Keep models under 10MB for fast loading
2. **Polygons**: Aim for 50k-100k polygons for web performance
3. **Textures**: Use compressed textures (WebP or JPEG)
4. **Use GLB**: Binary format loads faster than GLTF with separate files

### Converting Models

If you have models in other formats (FBX, OBJ, etc.):

1. Use [Blender](https://www.blender.org/) to import and export as GLTF/GLB
2. Use [gltf-pipeline](https://github.com/CesiumGS/gltf-pipeline) to optimize:
   ```bash
   gltf-pipeline -i model.gltf -o model.glb --draco.compressionLevel 10
   ```

### Material Names

For automatic color application, name body panels with recognizable names:
- Body panels: `body`, `hood`, `door`, `fender`, etc.
- Excluded from color: `glass`, `window`, `wheel`, `tire`

This allows the viewer to apply custom colors while preserving glass and wheels.
