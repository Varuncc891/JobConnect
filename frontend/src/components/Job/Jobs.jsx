import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    try {
      axios
        .get("http://localhost:4000/api/v1/job/getall", {
          withCredentials: true,
        })
        .then((res) => {
          setJobs(res.data);
          setFilteredJobs(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (jobs.jobs) {
      const filtered = jobs.jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs({ ...jobs, jobs: filtered });
    }
  }, [searchTerm, jobs]);

  if (!isAuthorized) {
    navigateTo("/");
  }

  return (
    <section className="jobs page">
      <div className="container">
        <h2>ALL AVAILABLE JOBS</h2>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title, category, or country"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setSearchTerm("")}>Clear</button>
        </div>

        <div className="banner">
          {filteredJobs.jobs && filteredJobs.jobs.length > 0 ? (
            filteredJobs.jobs.map((element) => {
              return (
                <div className="card" key={element._id}>
                  <p>{element.title}</p>
                  <p>{element.category}</p>
                  <p>{element.country}</p>
                  <Link to={`/job/${element._id}`}>Job Details</Link>
                </div>
              );
            })
          ) : (
            <p className="no-jobs">No jobs found matching your search.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Jobs;