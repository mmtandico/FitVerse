# 3D Model Setup Guide

This guide explains how to add and use custom 3D character models in FitVerse.

## Supported Formats

- **GLTF** (.gltf) - Recommended
- **GLB** (.glb) - Recommended (binary, single file)
- **FBX** (.fbx) - Supported (perfect for Mixamo models!)
- **OBJ** (.obj) - Not currently supported

## Step 1: Get a 3D Character Model

### Free Model Sources:

1. **Sketchfab** (https://sketchfab.com)
   - Search for "character", "avatar", "human"
   - Filter by: Free, Downloadable, GLTF format
   - Popular models: Ready Player Me avatars, VRoid models

2. **Poly Haven** (https://polyhaven.com/models)
   - Free 3D models
   - Some character models available

3. **Mixamo** (https://www.mixamo.com)
   - Free character models with animations
   - Export as FBX (fully supported!)
   - Steps:
     1. Browse characters on Mixamo
     2. Select a character
     3. Click "Download"
     4. Choose format: **FBX** (not GLTF)
     5. Save to `public/models/character.fbx`

4. **Ready Player Me** (https://readyplayer.me)
   - Create custom avatars
   - Export as GLB

5. **VRoid Hub** (https://hub.vroid.com)
   - Anime-style characters
   - Export as VRM (needs conversion) or GLTF

### Recommended Models:

- **Ready Player Me** - Professional, customizable
- **Mixamo Characters** - Good quality, free
- **Sketchfab Free Characters** - Various styles

## Step 2: Add Model to Your Project

1. Create a `public/models` folder in your project root:
   ```
   FitVerse/
   ├── public/
   │   └── models/
   │       └── character.glb
   ```

2. Place your model file in the `public/models` folder

3. Supported file names:
   - `character.glb` (GLTF binary)
   - `character.gltf` (GLTF text)
   - `character.fbx` (FBX - Mixamo format)
   - `avatar.glb`
   - `default-character.fbx`

## Step 3: Configure Model Path

In `src/App.jsx`, update the model path:

```javascript
// Option 1: Use a GLTF/GLB model
const modelPath = '/models/character.glb'

// Option 2: Use an FBX model (Mixamo)
const modelPath = '/models/character.fbx'

// Option 3: Use null to fall back to procedural avatar
const modelPath = null
```

## Step 4: Model Requirements

For best results, your model should:

1. **Be in T-pose or A-pose** (arms extended)
2. **Face forward** (positive Z direction)
3. **Be properly scaled** (around 1.7 units tall for average height)
4. **Have named parts** (for customization):
   - Parts with "skin", "body", "head" in name → will get skin color
   - Parts with "hair" in name → will get hair customization
   - Parts with "body", "torso", "chest" → will scale with weight

### Naming Convention:

For automatic customization, name your model parts:

- `Head`, `Body`, `Skin` → Skin color applied
- `Hair`, `HairMesh` → Hair color applied
- `Torso`, `Chest`, `Body` → Scales with weight
- `Arm_Left`, `Arm_Right` → Skin color applied
- `Leg_Left`, `Leg_Right` → Skin color applied

## Step 5: Customization Features

The system automatically:

1. **Scales model** based on height (normalizes to 170cm)
2. **Applies skin color** to body parts
3. **Customizes hair** based on hair type
4. **Scales body width** based on weight/BMI
5. **Enables shadows** for realistic rendering

## Step 6: Testing Your Model

1. Start your dev server: `npm run dev`
2. The model should load automatically
3. Test customization:
   - Change height → Model should scale
   - Change weight → Body should get wider/narrower
   - Change skin color → Body parts should change color
   - Change hair type → Hair should update

## Troubleshooting

### Model Not Loading

1. **Check file path**: Must be in `public/models/`
2. **Check file format**: Use GLTF, GLB, or FBX
3. **Check browser console**: Look for error messages
4. **Check file size**: Large files may take time to load
5. **FBX files**: Make sure you exported from Mixamo as FBX format

### Model Appears Too Big/Small

The system auto-scales, but you can adjust in `useModelAvatar.js`:

```javascript
const baseScale = 1.7 / Math.max(size.x, size.y, size.z)
// Change 1.7 to adjust base scale
```

### Colors Not Changing

1. **Check part names**: Must include "skin", "body", "head", etc.
2. **Check material type**: Must be MeshStandardMaterial or MeshPhongMaterial
3. **Check model structure**: Some models have nested groups

### Model Position Wrong

Adjust in `useModelAvatar.js`:

```javascript
model.position.y = -size.y * finalScale * 0.5
// Adjust the 0.5 value to change vertical position
```

## Example Model Setup

### Using Mixamo (FBX):

1. Go to https://www.mixamo.com
2. Browse and select a character
3. Click "Download"
4. Choose format: **FBX** (not GLTF)
5. Save as `public/models/character.fbx`
6. Update `src/App.jsx`:
   ```javascript
   const modelPath = '/models/character.fbx'
   ```
7. The model will load and be customizable!

### Using Ready Player Me (GLB):

1. Create avatar on https://readyplayer.me
2. Export as GLB
3. Save as `public/models/character.glb`
4. Update `src/App.jsx`:
   ```javascript
   const modelPath = '/models/character.glb'
   ```
5. The model will load and be customizable!

## Advanced: Multiple Models

To support multiple character models:

```javascript
const [selectedModel, setSelectedModel] = useState('character1.glb')

// In AvatarViewer:
const modelPath = selectedModel ? `/models/${selectedModel}` : null
```

## Tips

- **Optimize models**: Use tools like gltf-pipeline to reduce file size
- **Test early**: Load your model as soon as you get it
- **Name parts properly**: Makes customization easier
- **Use GLB format**: Single file, faster loading
- **Keep file size reasonable**: Under 5MB for web

## Need Help?

- Check Three.js GLTFLoader docs
- Check model file in a viewer (like https://gltf-viewer.donmccurdy.com)
- Check browser console for errors
- Verify model format and structure
