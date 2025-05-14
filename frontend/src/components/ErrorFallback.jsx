import toast from "react-hot-toast";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  toast.error(error.message, { duration: 5000, id: "error" });

  return (
    <div className="w-max mx-auto bg-red-200 py-4 px-8 rounded-2xl mt-30 flex flex-col items-center gap-3">
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button
        className="btn block mx-auto w-max border px-2 py-1 rounded-2xl text-green-600 cursor-pointer"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
};

export default ErrorFallback;
