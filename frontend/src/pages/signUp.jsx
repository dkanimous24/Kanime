import Form from "../components/form";

const SignUp = ({ onAuthenticated }) => {
  return (
    <>
      <div>
        <Form page={"signup"} onAuthenticated={onAuthenticated} />
      </div>
    </>
  );
};

export default SignUp;
