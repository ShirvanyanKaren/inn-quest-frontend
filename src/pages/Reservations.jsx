import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { getReservations, updateReservation, deleteReservation } from "../services/reservation";
import { Link } from "react-router-dom";
import { stateAbbreviations } from "../utils/helpers";
import Loading from "../components/Loading";
import dayjs from "dayjs";
import Auth from "../utils/auth";
import ImagesSlider from "../components/ImageSlider";
const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [currReservation, setReservation] = useState({
    check_in_date: "",
    check_out_date: "",
    num_of_rooms: 0,
  });
  const [show, setShow] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setShow(false);
    setShowCancel(false);
    setReservation({
      check_in_date: "",
      check_out_date: "",
      num_of_rooms: 0,
      id: 0,
    });
    setSuccess("");
    setError("");
  };

  useEffect(() => {
    if (!Auth.loggedIn()) window.location.replace("/login");
    setLoading(true);
    getReservations().then((response) => {
      const data = response.data;
      console.log(data);
      for (const reservation of data) {
        let nights = dayjs(reservation.check_out_date).diff(
          dayjs(reservation.check_in_date),
          "day",
        );
        reservation.nights = nights;
      }
      setLoading(false);
      setReservations(data);
    });
  }, [success]);

  const submitUpdate = () => {
    setSuccess("");
    setError("");
    updateReservation(currReservation).then((response) => {
      if (response.status === 200) {
        setSuccess("Reservation updated successfully");
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        response = response.response ? response.response : response;
        let error = response.data.error ? response.data.error : "Error updating reservation";
        setError(error);
      }
    });
  };

  const submitCancel = () => {
    setError("");
    setSuccess("");
    console.log(currReservation);
    deleteReservation(currReservation).then((response) => {
      if (response.status === 204) {
        setSuccess("Reservation cancelled successfully");
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        response = response.response ? response.response : response;
        let error = response.data.error ? response.data.error : "Error cancelling reservation";
        setError(error);
      }
    });
  };

  const handleShowCancel = (reservation) => {
    return () => {
      setShowCancel(true);
      setReservation(reservation);
    };
  };

  const handleChange = (e) => {
    if (e.target.id === "num_of_rooms") {
      setReservation({ ...currReservation, num_of_rooms: Number(e.target.value) });
    } else {
      setReservation({ ...currReservation, [e.target.id]: e.target.value });
    }
  }

  const handleShow = (reservation) => {
    return () => {
      setError("");
      setSuccess("");
      setShow(true);
      setReservation(reservation);
    };
  };

  return (
    <div className="container">
      <h1 className="text-center mt-2">Reservations</h1>
      <div className="d-flex flex-wrap justify-content-center">
        {(!reservations.length && !loading) && (
          <h2 className="text-center mt-5">No reservations found</h2>
        )}
        {loading ? (
          <>
          <Loading />
          </>
        ) : (
          <>
        {reservations.map((reservation, index) => {
          return (
            <div key={reservation.id} className="col-12-lg">
               <div className="card mt-3">
                <div className="row no-gutters">
                  <div className="col-md-4"
                  >
                    <ImagesSlider 
                    style={{borderRadius: '10px'}} 
                    images={reservation.image_urls} />
                  </div>
                  <div className="col-md-8">
                      <div className="card-body">
                      <Link
                      to={`/rooms/${reservation.hotel}`}
                      style={{ textDecoration: "none", color: "black" }}
                    >
                        <h5 className="card-title">{reservation.hotel_name}</h5>
                        </Link>
                        <div className="reservation-details">
                            <li className='list-group-item'>
                                <strong>Check-in</strong>:
                                <span className="float-end">
                                    {dayjs(reservation.check_in_date).format("MMMM DD, YYYY")} (from 11:00)
                                </span>
                            </li>
                            <li className='list-group-item'>
                                <strong>Check-out</strong>:
                                <span className="float-end">
                                    {dayjs(reservation.check_out_date).format("MMMM DD, YYYY")} (until 12:00)
                                </span>
                            </li>
                            <li className='list-group-item'>
                                <strong>Price</strong>:
                                <span className="float-end">
                                    ${reservation.reservation_price.toFixed(2)} 
                                </span>
                            </li>
                            <li className='list-group-item'>
                                <strong>Number of Rooms:</strong>
                                <span className="float-end">
                                    {reservation.num_of_rooms}
                                </span>
                            </li>
                            <li className='list-group-item'>
                                <strong>Total Nights</strong>:
                                <span className="float-end">
                                    {reservation.nights}
                                </span>
                            </li>
                        <button
                            onClick={handleShow(reservation)}
                            className="btn btn-light mt-3 me-2"
                            style={{border: '1px solid #004aad'}}
                        >
                            Update Reservation
                        </button>
                        <button className="btn btn-danger mt-3"
                            onClick={() => 
                            {
                              setShowCancel(true)
                              setReservation(reservation)
                              console.log(reservation)
                            }
                            }
                            >
                            Cancel Reservation
                        </button>

                        </div>
                        </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </>
        )}
        <Modal show={showCancel} onHide={() => setShowCancel(false)}>
          <Modal.Header closeButton>
            <Modal.Title> Cancel Reservation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to cancel this reservation?</p>
          </Modal.Body>
          <Modal.Footer>
            {success && <p className="me-2 text-success">{success}</p>}
            {error && <p className="me-2 text-danger">{error}</p>}
            <button 
            onClick={submitCancel}
            className="btn btn-danger">Yes
            </button>
            <button
              onClick={() => setShowCancel(false)}
              className="btn btn-primary"
            >
              No
            </button>
          </Modal.Footer>
        </Modal>
        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Reservation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form
              className="d-flex flex-column"
              onChange={handleChange}
            >
              <div className="d-flex flex-column">
                <label htmlFor="checkin">Check-in</label>
                <input
                  type="date"
                  id="check_in_date"
                  className="form-control"
                  value={currReservation.check_in_date}
                />
                <label htmlFor="checkout">Check-out</label>
                <input
                  type="date"
                  id="check_out_date"
                  className="form-control"
                  value={currReservation.check_out_date}
                />
                <label htmlFor="numRooms">Number of rooms</label>
                <input
                  type="number"
                  id="num_of_rooms"
                  className="form-control"
                  value={currReservation.num_of_rooms}
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            {success && <p className="me-2 text-success">{success}</p>}
            {error && <p className="me-2 text-danger">{error}</p>}
            <button onClick={submitUpdate} className="btn btn-primary">
              Update
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Reservations;
