// Bio group color mapping for UI components
export const getBioGroupColor = (bioGroup: string) => {
  const colors: Record<string, string> = {
    '鳥類': 'bg-red-500',
    '兩棲類': 'bg-blue-500', 
    '哺乳類': 'bg-orange-500',
    '爬蟲類': 'bg-green-500',
    '魚類': 'bg-purple-500',
    '昆蟲': 'bg-yellow-500',
    '蜘蛛': 'bg-gray-600'
  };
  return colors[bioGroup] || 'bg-gray-400';
};

// Map layer color mapping (hex colors for Mapbox)
export const getBioGroupMapColor = (bioGroup: string) => {
  const colors: Record<string, string> = {
    '鳥類': '#e74c3c',
    '兩棲類': '#3498db', 
    '哺乳類': '#f39c12',
    '爬蟲類': '#27ae60',
    '魚類': '#9b59b6',
    '昆蟲': '#e67e22',
    '蜘蛛': '#34495e'
  };
  return colors[bioGroup] || '#95a5a6';
};

// Get all available bio groups
export const getBioGroups = () => [
  '鳥類', '兩棲類', '哺乳類', '爬蟲類', '魚類', '昆蟲', '蜘蛛'
];