# Avatar Customization Guide

This guide explains how to customize the default avatar design in FitVerse.

## 1. Default Avatar Values

The default values are set in `src/App.jsx` at the top of the `App` component:

```javascript
const [height, setHeight] = useState(170) // Default height in cm (140-200)
const [weight, setWeight] = useState(70) // Default weight in kg (40-120)
const [skinColor, setSkinColor] = useState('#FDBCB4') // Default skin color
const [hairType, setHairType] = useState('short') // Default hair type
```

### To Change Default Values:

**Height:**
- Change `170` to any value between 140-200
- Example: `useState(180)` for 180cm default

**Weight:**
- Change `70` to any value between 40-120
- Example: `useState(65)` for 65kg default

**Skin Color:**
- Available options:
  - `'#FDBCB4'` - Light
  - `'#E8A87C'` - Medium Light
  - `'#D08B5B'` - Medium
  - `'#AE5D29'` - Medium Dark
  - `'#8B4513'` - Dark
- Or use any hex color code
- Example: `useState('#E8A87C')` for Medium Light default

**Hair Type:**
- Available options: `'short'`, `'medium'`, `'long'`, `'curly'`, `'bald'`
- Example: `useState('medium')` for medium hair default

## 2. Avatar Proportions

The avatar proportions are calculated in the `useEffect` hook that creates the avatar. You can find these calculations around line 240-250:

```javascript
const heightScale = currentHeight / 170 // Normalize to 170cm
const bmi = currentWeight / ((currentHeight / 100) ** 2)
const bodyWidth = 0.45 + (bmi - 22) * 0.025 // Adjust width based on BMI
const bodyWidthClamped = Math.max(0.4, Math.min(0.65, bodyWidth))
const headSize = 0.3 * heightScale
```

### Customizing Proportions:

**Head Size:**
- Change `0.3` to adjust head size relative to height
- Larger value = bigger head (e.g., `0.35`)
- Smaller value = smaller head (e.g., `0.25`)

**Body Width:**
- Change `0.45` (base width) to make default body wider/narrower
- Change `0.025` (BMI multiplier) to adjust how much weight affects body width
- Change `0.4` and `0.65` (min/max) to set body width limits

## 3. Body Part Sizes

You can customize individual body parts by finding their geometry definitions:

**Neck:**
```javascript
const neckGeometry = new THREE.CylinderGeometry(
  0.12 * heightScale,  // Top radius
  0.12 * heightScale,   // Bottom radius
  0.15 * heightScale,   // Height
  16
)
```

**Arms:**
- Upper arm: `0.1 * heightScale` (radius), `0.35 * heightScale` (length)
- Lower arm: `0.08-0.09 * heightScale` (radius), `0.3 * heightScale` (length)
- Hand: `0.1 * heightScale` (radius)

**Legs:**
- Upper leg: `0.12-0.13 * heightScale` (radius), `0.4 * heightScale` (length)
- Lower leg: `0.1-0.11 * heightScale` (radius), `0.35 * heightScale` (length)
- Foot: `0.15 * heightScale` (width), `0.2 * heightScale` (length)

## 4. Facial Features

**Eyes:**
- Eye size: `0.08 * heightScale`
- Pupil size: `0.04 * heightScale`
- Eye color: `0xffffff` (white)
- Pupil color: `0x000000` (black)

**Mouth:**
- Size: `0.06 * heightScale`
- Color: `0xff6b6b` (red/pink)
- Change color to any hex value

## 5. Hair Styles

Hair styles are defined in the `getHairGeometry` function. You can customize:

**Short Hair:**
```javascript
new THREE.SphereGeometry(0.32 * scale, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5)
```

**Medium Hair:**
```javascript
new THREE.CylinderGeometry(0.32 * scale, 0.3 * scale, 0.2 * scale, 32)
```

**Long Hair:**
```javascript
new THREE.CylinderGeometry(0.32 * scale, 0.3 * scale, 0.4 * scale, 32)
```

**Curly Hair:**
- Number of curls: Change `12` in the loop
- Curl size: `0.06 * heightScale`
- Curl radius: `0.25 * heightScale`

**Hair Colors:**
- Regular hair: `'#2C1810'` (dark brown)
- Curly hair: `'#4A3728'` (brown)

## 6. Colors

**Skin Colors:**
- Defined in `skinColors` array
- Add new colors by adding objects: `{ name: 'Your Color', value: '#HEXCODE' }`

**Clothing/Feet:**
- Foot color: `0x333333` (dark gray)
- Change to any hex color

## 7. Camera Position

The camera position affects how the avatar is viewed:

```javascript
camera.position.set(0, 1.2, 3.5) // x, y, z position
camera.lookAt(0, 1, 0) // Where camera looks
```

**To adjust:**
- First number (0): Left/Right position
- Second number (1.2): Height
- Third number (3.5): Distance from avatar
- `lookAt` second number (1): Vertical focus point

## 8. Lighting

```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6) // Color, Intensity
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8) // Color, Intensity
directionalLight.position.set(5, 10, 5) // Light direction
```

**To adjust:**
- Change color: `0xffffff` (white) to any hex color
- Change intensity: `0.6` and `0.8` (0-1 range)
- Change position: `(5, 10, 5)` for different lighting angles

## Example: Complete Default Avatar Change

To set a default avatar with:
- Height: 175cm
- Weight: 75kg
- Medium skin tone
- Long hair

Change the useState values to:
```javascript
const [height, setHeight] = useState(175)
const [weight, setWeight] = useState(75)
const [skinColor, setSkinColor] = useState('#D08B5B')
const [hairType, setHairType] = useState('long')
```

## Tips

1. **Test incrementally**: Change one value at a time to see the effect
2. **Proportions matter**: Keep body parts proportional to height
3. **Colors**: Use hex color pickers to find exact colors you want
4. **Save your changes**: The avatar will use these defaults when the page loads
