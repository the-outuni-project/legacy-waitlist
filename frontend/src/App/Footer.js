import { useState } from "react";
import styled from "styled-components";
import A from "../Components/A";
import { Box } from "../Components/Box";
import { Modal } from "../Components/Modal";

const FooterDom = styled.footer` 
    text-align: center;
    
    ul {
       li {
            display: inline-block;
            padding: 10px;
       } 
    }
`;

const H2 = styled.h2`
    font-size: 1.2em;
    font-weight: 600;
`;

const H3 = styled.h2`
    font-size: 1em;
    font-weight: 600;
`;

const LegalNotices = () => {
    const [ open, setOpen ] = useState(false);

    return (
        <>
            <A onClick={() => setOpen(true)}>Legal Notices</A>
            <Modal open={open} setOpen={setOpen}>
                <Box style={{ maxWidth: '700px' }}>
                    <H2>Legal Notices</H2>
                    <H3>CCP Games:</H3>
                    <p style={{paddingBottom: "10px"}}>
                        EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved
                        worldwide. All other trademarks are the property of their respective owners. EVE Online, the
                        EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf.
                        All artwork, screenshots, characters, vehicles, storylines, world facts or other
                        recognizable features of the intellectual property relating to these trademarks are likewise
                        the intellectual property of CCP hf. CCP hf. has granted permission to The Outuni Project to use EVE
                        Online and all associated logos and designs for promotional and information purposes on its
                        website but does not endorse, and is not in any way affiliated with, The Outuni Project. CCP is in no
                        way responsible for the content on or functioning of this website, nor can it be liable for
                        any damage arising from the use of this website.
                    </p>

                    <H3>Waitlist</H3>
                    <p>
                        The source code for The Outuni Project is available under the MIT license. The source code and fulltext for 
                        this license can be found <A href="https://github.com/samuelgrant/top-waitlist/" target="_blank">here</A>.
                    </p>
                </Box>
            </Modal>
        </>        
    )
}

const Footer = () => {
    return (
        <FooterDom>
            <p>The Outuni Project &copy; {new Date().getFullYear()}</p>
            <ul>
                <li>
                    <LegalNotices />
                </li>
                <li>
                    <A href="https://github.com/samuelgrant/top-waitlist" target="_blank">Source Code</A>
                </li>
            </ul>            
            
        </FooterDom>
    )    
}

export default Footer;