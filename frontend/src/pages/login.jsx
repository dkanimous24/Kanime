import Form from "../components/form";

const Login = ({ onAuthenticated }) => {
  return (
    <>
      <div>
        <Form page={"login"} onAuthenticated={onAuthenticated} />
      </div>
    </>
  );
};

export default Login;
