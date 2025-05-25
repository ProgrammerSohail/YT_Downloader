"use client";
import PropTypes from 'prop-types';

// Utility function to get user-friendly quality names
const getQualityLabel = (itag, originalLabel) => {
  if (!originalLabel) return `Quality ${itag}`;

  // Check if it's an audio-only format (no resolution, just itag and size)
  if (originalLabel.match(/^\d+(\.\d+)?\s*-\s*\d+\.\d+\s*MB$/)) {
    // Parse bitrate from itag for audio formats
    const audioQualityMap = {
      '139': 'Audio 48kbps',
      '140': 'Audio 128kbps',
      '141': 'Audio 256kbps',
      '171': 'Audio 128kbps',
      '249': 'Audio 50kbps',
      '250': 'Audio 70kbps',
      '251': 'Audio 160kbps'
    };
    
    if (audioQualityMap[itag]) {
      return audioQualityMap[itag];
    }
    
    // Generic audio fallback
    return `Audio ${itag}`;
  }

  // Extract resolution patterns like "640x360", "1920x1080", etc.
  const resolutionMatch = originalLabel.match(/(\d+)x(\d+)/);
  if (resolutionMatch) {
    const width = parseInt(resolutionMatch[1]);
    const height = parseInt(resolutionMatch[2]);
    
    // Determine quality based on height
    let qualityName = '';
    if (height >= 4320) qualityName = '8K';
    else if (height >= 2160) qualityName = '4K';
    else if (height >= 1440) qualityName = '2K';
    else if (height >= 1080) qualityName = '1080p Full HD';
    else if (height >= 720) qualityName = '720p HD';
    else if (height >= 480) qualityName = '480p';
    else if (height >= 360) qualityName = '360p';
    else if (height >= 240) qualityName = '240p';
    else if (height >= 144) qualityName = '144p';
    else qualityName = `${height}p`;

    // Check if it includes audio or is video only
    if (originalLabel.includes('Video + Audio')) {
      return `${qualityName} (Video + Audio)`;
    } else if (originalLabel.includes('Also Select Audio')) {
      return `${qualityName} (Video Only)`;
    } else {
      return qualityName;
    }
  }

  // Extract fps information if present
  const fpsMatch = originalLabel.match(/(\d+)fps/);
  const fps = fpsMatch ? fpsMatch[1] : '';

  // Look for specific quality indicators in the label
  if (originalLabel.includes('3840x2160')) return fps ? `4K ${fps}fps` : '4K';
  if (originalLabel.includes('2560x1440')) return fps ? `2K ${fps}fps` : '2K';
  if (originalLabel.includes('1920x1080')) return fps ? `1080p Full HD ${fps}fps` : '1080p Full HD';
  if (originalLabel.includes('1280x720')) return fps ? `720p HD ${fps}fps` : '720p HD';
  if (originalLabel.includes('854x480')) return fps ? `480p ${fps}fps` : '480p';
  if (originalLabel.includes('640x360')) return fps ? `360p ${fps}fps` : '360p';
  if (originalLabel.includes('426x240')) return fps ? `240p ${fps}fps` : '240p';
  if (originalLabel.includes('256x144')) return fps ? `144p ${fps}fps` : '144p';

  // Final fallback: return original label
  return originalLabel;
};

const QualitySelector = ({ label, options, value, onChange, id }) => {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block mb-3 font-semibold text-gray-700 text-sm uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="w-full py-4 px-5 pr-12 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 text-base appearance-none cursor-pointer transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-sm hover:border-gray-300 hover:shadow-md"
          value={value}
          onChange={onChange}
        >
          <option value="">{`Select ${label}`}</option>
          {options.map(option => (
            <option key={option.itag} value={option.itag}>
              {getQualityLabel(option.itag, option.label)}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

QualitySelector.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      itag: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default QualitySelector;