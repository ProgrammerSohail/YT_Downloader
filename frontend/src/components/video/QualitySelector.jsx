"use client";
import PropTypes from 'prop-types';

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
              {option.label}
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
