export const Login = () => {
  return (
    <div className='h-screen flex justify-center items-center'>
      <a
        href='http://localhost:8000/auth/login'
        className='block px-6 py-4 bg-red-500 text-white rounded-xl'
      >
        Log in with Microsoft
      </a>
    </div>
  );
};
