    import { usePWAInstall } from "./usePWAInstall";

const CustomPopup = () => {
  const { canInstall, installApp } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white shadow-xl rounded-xl p-4 z-50">
      <h3 className="text-lg font-semibold">
        📱 Install Our App
      </h3>
      <p className="text-sm text-gray-600">
        Faster, smoother & app-like experience
      </p>

      <button
        onClick={installApp}
        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        Install App
      </button>
    </div>
  );
};

export default CustomPopup;
