import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const [success, setSuccess] = useState();
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    useEffect(() => {
        axios.get("http://localhost:3001/dashboard").then((res) => {
            console.log("dashboard: " + res.data);
            if (res.data === "Success") {
                setSuccess("Succeeded OK");
            } else {
                navigate("/");
            }
        }).catch(err => console.log(err));
    }, []);
    return (
        <div>
            <h2>Dashboard</h2>
            <p>{success}</p>
        </div>
    );
};

export default Dashboard;