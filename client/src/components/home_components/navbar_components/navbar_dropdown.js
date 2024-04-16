import { Link } from "react-router-dom";

const NavBarDropDown = (props) => {
    return (
        <div className='home-dropdown noselect'>

            <div className='home-dropdown-btn home-nav-btn'
                style={{
                    borderRadius: "20px",
                    backgroundColor: props.is_email ? "var(--main-50-opacity)" : "transparent"
                }}>
                <b>{props.btn_name}</b>
            </div>

            <div className="home-dropdown-content">
                {props.link_content.map(
                    ([k, v]) => (
                        <Link
                            key={k}
                            to={v}
                        >{k}</Link>
                    )
                )}
                {props.btn_content.map(
                    ([k, v]) => (
                        <div
                            key={k}
                            onClick={v}
                        >{k}</div>
                    )
                )}
            </div>
        </div>
    )
}

export default NavBarDropDown