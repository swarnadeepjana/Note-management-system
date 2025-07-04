// src/components/Loader.jsx
function Loader() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default Loader;
