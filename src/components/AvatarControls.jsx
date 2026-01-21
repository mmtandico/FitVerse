function AvatarControls({
  gender,
  height,
  weight,
  skinColor,
  hairType,
  onGenderChange,
  onHeightChange,
  onWeightChange,
  onSkinColorChange,
  onHairTypeChange,
  onSave,
  onLoad,
  isAuthenticated,
  loading,
}) {
  const skinColors = [
    { name: 'Light', value: '#FDBCB4' },
    { name: 'Medium Light', value: '#E8A87C' },
    { name: 'Medium', value: '#D08B5B' },
    { name: 'Medium Dark', value: '#AE5D29' },
    { name: 'Dark', value: '#8B4513' },
  ]

  const hairTypes = ['short', 'medium', 'long', 'curly', 'bald']

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#e5e7eb] p-8 animate-fade-in">
      <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-8">
        Customize
      </h2>

      {/* Gender Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wide mb-4">
          Gender
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onGenderChange('male')}
            className={`px-6 py-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${gender === 'male'
              ? 'border-[#dc2626] bg-[#dc2626] text-white shadow-sm'
              : 'border-[#e5e7eb] bg-white text-[#1a1a1a] hover:border-[#dc2626] hover:bg-[#fee2e2]'
              }`}
          >
            Male
          </button>
          <button
            onClick={() => onGenderChange('female')}
            className={`px-6 py-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${gender === 'female'
              ? 'border-[#dc2626] bg-[#dc2626] text-white shadow-sm'
              : 'border-[#e5e7eb] bg-white text-[#1a1a1a] hover:border-[#dc2626] hover:bg-[#fee2e2]'
              }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* Height Control */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wide">
            Height
          </label>
          <span className="text-2xl font-semibold text-[#dc2626]">
            {height} cm
          </span>
        </div>
        <input
          type="range"
          min="140"
          max="200"
          value={height}
          onChange={(e) => onHeightChange(Number(e.target.value))}
          className="w-full slider"
          style={{
            height: '24px',
            cursor: 'pointer'
          }}
        />
        <div className="flex justify-between text-xs text-[#6b7280] mt-3 font-medium">
          <span>140</span>
          <span>200</span>
        </div>
      </div>

      {/* Weight Control */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wide">
            Weight
          </label>
          <span className="text-2xl font-semibold text-[#dc2626]">
            {weight} kg
          </span>
        </div>
        <input
          type="range"
          min="40"
          max="120"
          value={weight}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          className="w-full slider"
          style={{
            height: '24px',
            cursor: 'pointer'
          }}
        />
        <div className="flex justify-between text-xs text-[#6b7280] mt-3 font-medium">
          <span>40</span>
          <span>120</span>
        </div>
      </div>

      {/* Skin Color Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wide mb-4">
          Skin Color
        </label>
        <div className="grid grid-cols-5 gap-3">
          {skinColors.map((color) => (
            <button
              key={color.value}
              onClick={() => onSkinColorChange(color.value)}
              className={`h-16 rounded-xl border-2 transition-all duration-200 ${skinColor === color.value
                ? 'border-[#dc2626] scale-105 shadow-lg shadow-[#dc2626]/30'
                : 'border-[#e5e7eb] hover:border-[#dc2626] hover:scale-102'
                }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Hair Type Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wide mb-4">
          Hair Type
        </label>
        <div className="grid grid-cols-5 gap-2">
          {hairTypes.map((type) => (
            <button
              key={type}
              onClick={() => onHairTypeChange(type)}
              className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${hairType === type
                ? 'border-[#dc2626] bg-[#dc2626] text-white shadow-sm'
                : 'border-[#e5e7eb] bg-white text-[#1a1a1a] hover:border-[#dc2626] hover:bg-[#fee2e2]'
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Save/Load Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={onSave}
          disabled={loading}
          className="flex-1 bg-[#dc2626] text-white py-3 px-6 rounded-xl hover:bg-[#b91c1c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm apple-button disabled:hover:bg-[#dc2626]"
        >
          {loading ? 'Saving...' : 'Save Avatar'}
        </button>
        <button
          onClick={onLoad}
          disabled={loading || !isAuthenticated}
          className="flex-1 bg-white text-[#dc2626] py-3 px-6 rounded-xl hover:bg-[#fee2e2] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm apple-button border-2 border-[#dc2626] disabled:hover:bg-white"
        >
          {loading ? 'Loading...' : 'Load Avatar'}
        </button>
      </div>
      {!isAuthenticated && (
        <p className="text-sm text-[#6b7280] text-center mt-6 bg-[#fee2e2] px-4 py-3 rounded-xl border border-[#fecaca]">
          <span className="font-medium">Sign in to save and load your avatar</span>
        </p>
      )}
    </div>
  )
}

export default AvatarControls
