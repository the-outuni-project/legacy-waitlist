import { useContext, useState } from "react";
import { AuthContext, ToastContext } from "../../contexts";
import { apiCall, errorToaster } from "../../api";
import { Button, Input, Label } from "../../Components/Form";
import { Modal } from "../../Components/Modal";
import { Box } from "../../Components/Box";
import A from "../../Components/A";

async function setWikiPassword(password) {
  return await apiCall("/api/auth/wiki", {
    method: "POST",
    json: {
      password,
    },
  });
}

const WikiPassword = () => {
  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);

  const [ open, isOpen ] = useState(false);
  const [ value, setValue ] = useState(undefined);

  const onClick = (e) => {
    e.preventDefault();

    errorToaster(
      toastContext,
      setWikiPassword(value).then(() => {
        isOpen(false);
        setValue(undefined);
      })
    );
  };

  if (!authContext.access['waitlist-tag:TRAINEE']) {
    return null;
  }

  return (
    <>
      <Button onClick={() => isOpen(true)}>Set Wiki Password</Button>
      <Modal open={open} setOpen={isOpen}>
        <Box>
          <h2 style={{ fontSize: "1.5em" }}>Set a Wiki Password</h2>

          <p style={{ paddingBottom: "10px" }}>
            <A href={`https://wiki.${window.location.host}?do=login`} target="_blank">
              Wiki Login
            </A>
          </p>

          <form style={{ paddingTop: "15px" }}>
            <div style={{ paddingBottom: "10px" }}>
              <Label htmlFor="username">Your wiki username:</Label>
              <Input
                id="username"
                value={(authContext?.characters[0]?.name ?? "")
                  .toLowerCase()
                  .replace(/ /g, "_")
                  .replace(/'/g, "")}
                disabled
              />
            </div>

            <div style={{ paddingBottom: "20px" }}>
              <Label htmlFor="password">Set a New Password:</Label>
              <Input
                id="password"
                type="password"
                value={value}
                minLength="8"
                autoComplete="none"
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>

            <Button variant="success" onClick={onClick}>
              Save Password
            </Button>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default WikiPassword;