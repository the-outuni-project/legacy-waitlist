import styled from "styled-components";
import { Button as BaseButton, AButton as BaseAButton } from "../../../../../Components/Form";

const Button = styled(BaseButton)`
    font-size: small;
    height: unset;
    line-height: unset;
    margin: 3px 5px 7px 0px;
    padding: 1px 6px;

    &[disabled] {
        cursor: not-allowed;
    }
`;

const AButton = styled(BaseAButton)`
    font-size: small;
    height: unset;
    line-height: unset;
    margin: 3px 5px 7px 0px;
    padding: 1px 6px;

    &[disabled] {
        cursor: not-allowed;
    }
`;

export { Button, AButton };
