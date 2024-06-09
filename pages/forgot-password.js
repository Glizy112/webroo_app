import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Joi from "@hapi/joi";

import config from "../config/config.json";
import Layout from "../components/layout/layout";
import Loading from "../components/common/loading";
import Form from "../components/common/form";
import Input from "../components/common/input";
import ValidationService from "../shared/validation-service";
import LoginService from "../screens/login/login-service";

class ForgotPasswordModel {
  email = "";
}

class ForgotPasswordValidation {
  schema = Joi.object({
    email: Joi.string()
      .required()
      .max(config.maxLength)
      .email({ tlds: { allow: false } })
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "string.empty":
              err.message = "Email address is required";
              break;
            case "string.email":
              err.message = "Invalid email address";
              break;
            case "string.max":
              err.message = `Email address must be less than or equal ${config.max} characters!`;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  });
}

function ForgotPassword() {
  const schema = new ForgotPasswordValidation().schema;
  const [forgotPasswordModel, setForgotPasswordModel] = useState(
    new ForgotPasswordModel()
  );
  const [errors, setErrors] = useState({});
  const [requesting, setRequesting] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState("");

  const router = useRouter();

  // handle change
  const handleChange = ({ currentTarget: input }) => {
    setServerErrorMessage("");
    const errorsList = { ...errors };
    const forgotPasswordData = Object.assign(
      new ForgotPasswordModel(),
      forgotPasswordModel
    );
    forgotPasswordData[input.name] = input.value;
    const errorMessage = ValidationService.validateProperty(
      input,
      schema,
      forgotPasswordData
    );
    if (errorMessage) errorsList[input.name] = errorMessage;
    else delete errorsList[input.name];
    setErrors(errorsList);
    setForgotPasswordModel(forgotPasswordData);
  };

  // handle forgot password
  const handleForgotPassword = async () => {
    const isValid = validate();
    if (!isValid) return setRequesting(false);

    try {
      const res = await LoginService.forgotPassword(forgotPasswordModel);
      console.log(res);
    } catch (error) {}
  };

  const validate = () => {
    const err = ValidationService.validate(schema, forgotPasswordModel);
    if (err) {
      setErrors(err);
      return false;
    } else {
      setErrors({});
      return true;
    }
  };

  return (
    <Layout pageTitle="forgot password" showHeaderAndFooter={false}>
      <div
        className="auth__mainblock webapp__auth__main d-flex"
        style={{ marginTop: "-83px" }}
      >
        {/* left section - image background */}
        <div className="login-side-image col-lg-6 d-lg-flex d-md-none d-none"></div>

        {/* right section - forgot password form`` */}
        <div className="login-content col-lg-5 col-md-12">
          {/* webroo logo */}
          <Link href="/">
            <img className="logo-bg" src="/assets/logo.png" />
          </Link>

          {/* form title and description */}
          <h1 className="mt-4 ml-4 gray">Forgot your password</h1>
          <p className="ml-4" style={{ lineHeight: "2" }}>
            Fill in your email and we will send a reset password link to your
            email.
          </p>

          {/* form */}
          <Form
            className="form signin-form d-flex flex-column justify-content-between"
            doSubmit={handleForgotPassword}
          >
            {/* email field */}
            <div>
              <div className="form-group mb-4">
                <Input
                  name="email"
                  placeholder="Your email"
                  type="email"
                  className="form-control"
                  value={forgotPasswordModel.email}
                  onChange={handleChange}
                  error={errors.email}
                />
              </div>

              <div className="d-flex flex-column justify-content-center mt-4">
                <button type="submit" className="mt-1 mb-1 kh-btn">
                  Send reset link
                </button>
              </div>
            </div>

            <div className="gray mt-4 d-flex flex-row justify-content-center pt-4 ">
              Already have WebRoo account?
              <Link href="/login">
                <a className=" ml-2 red">Login now</a>
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </Layout>
  );
}

export default ForgotPassword;
