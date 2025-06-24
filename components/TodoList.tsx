import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const schema = z.object({
  text: z.string().min(1, "You must enter the task."),
});
type CreateTodo = z.infer<typeof schema>;

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  status: string;
  isChecked: boolean;
}

function TodoList() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTodo>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: CreateTodo) => {
    console.log("المهمة:", data.text);
    addTodo(data.text);
    reset();
  };

  const [buttonSelect, setbuttonSelect] = useState(false);
  const [tasks, setTasks] = useState<Todo[]>([]);
  const status = ["active", "complete", "on-Hold"];
  const [filter, setfilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);

  const [allSelect, setallSelect] = useState<Todo[]>([]);

  const handleChekbox = (task: Todo) => {
    const isAlreadySelected = allSelect.some((t) => t.id === task.id);
    let updatedSelect: Todo[];

    if (isAlreadySelected) {
      updatedSelect = allSelect.filter((t) => t.id !== task.id);
    } else {
      updatedSelect = [...allSelect, task];
    }

    setallSelect(updatedSelect);
    localStorage.setItem("allSelect", JSON.stringify(updatedSelect));
  };

  function toOnHold() {
    allSelect.forEach((task) => {
      task.status = status[2];
    });

    setallSelect([]);
    localStorage.removeItem("allSelect");
  }

  function toactive() {
    allSelect.forEach((task) => {
      task.status = status[0];
    });

    setallSelect([]);
    localStorage.removeItem("allSelect");
  }

  function tocomplete() {
    allSelect.forEach((task) => {
      task.status = status[1];
      if (task.id !== undefined) {
        markComplete(task.id);
      }
    });

    setallSelect([]);
    localStorage.removeItem("allSelect");
  }

  function toDelete() {
    const updated = tasks.filter(
      (task) => !allSelect.some((selected) => selected.id === task.id)
    );
    setallSelect([]);

    localStorage.removeItem("allSelect");
    setTasks(updated);
    localStorage.setItem("data-task", JSON.stringify(updated));
  }

  const toggleModal = () => {
    setModal(!modal);
  };

  const markComplete = (id: number) => {
    tasks.forEach((task) => {
      if (task.id === id) {
        task.status = status[1];
        task.completed = true;
      }
      setTasks([...tasks]);
    });
  };

  const hold = (id: number) => {
    tasks.forEach((task) => {
      if (task.id === id) {
        task.status = status[2];
      }
      setTasks([...tasks]);
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem("allSelect");
    const data = localStorage.getItem("data-task");
    if (stored) {
      setallSelect(JSON.parse(stored));
    }
    if (data) {
      setTasks(JSON.parse(data));
    }
  }, []);

  const addTodo = (text: string) => {
    const newTask = {
      id: Date.now(),
      text: text,
      completed: false,
      status: status[0],
      isChecked: false,
    };

    const updateTask = [...tasks, newTask];
    setTasks(updateTask);
    localStorage.setItem("data-task", JSON.stringify(updateTask));
  };
  const deleteTask = (id: number) => {
    const updated = tasks.filter((task) => task.id !== id);
    setTasks(updated);
    localStorage.setItem("data-task", JSON.stringify(updated));
  };

  const deleteAllTaskCompleted = () => {
    const updated = tasks.filter((task) => task.completed === false);
    setTasks(updated);
    localStorage.setItem("data-task", JSON.stringify(updated));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="container vw-100 vh-100 align-items-center pt-5">
        <div className="row gx-1">
          <h1>To-do-List</h1>

          <div className="col-md-4">
            <div className="input-group ">
              <input
                {...register("text")}
                type="text"
                placeholder="Enter a task..."
                className={`form-control ${errors.text ? "is-invalid" : ""}`}
              />
            </div>
            {errors.text && (
              <div className="invalid-feedback d-block">
                {errors.text.message}
              </div>
            )}
          </div>

          <div className="col-md-auto">
            <button type="submit" className={"btn btn-outline-success"}>
              Add
            </button>
          </div>

          <div className="col-md-auto">
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                filter by status
              </button>
              <ul className="dropdown-menu">
                <li>
                  <a
                    onClick={() => setfilter("all")}
                    className="dropdown-item"
                    href="#"
                  >
                    all
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setfilter("active")}
                    className="dropdown-item"
                  >
                    {" "}
                    active
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setfilter("complete")}
                    className="dropdown-item"
                  >
                    {" "}
                    complete
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setfilter("on-Hold")}
                    className="dropdown-item"
                  >
                    on-Hold
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-auto">
            <button
              onClick={() => deleteAllTaskCompleted()}
              className={"btn btn-outline-danger"}
            >
              Delete All complete
            </button>
          </div>

          <div className="col-md-auto">
            <button
              onClick={() => {
                setbuttonSelect(!buttonSelect);
              }}
              className={"btn btn-outline-danger"}
            >
              Select
            </button>
          </div>
        </div>

        <div className="row">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Task</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
                {buttonSelect && <th scope="col">Select</th>}
              </tr>
            </thead>
            <tbody>
              {tasks
                .filter((task) => task.status === filter || filter === "all")
                .map((task, index) => (
                  <tr>
                    <td
                      className="list-group-item d-flex justify-content-between align-items-start"
                      key={index + 1}
                    >
                      {index + 1}
                    </td>
                    <td>
                      <span
                        className={
                          task.completed
                            ? "text-decoration-line-through "
                            : "btn-light"
                        }
                      >
                        {task.text}
                      </span>
                    </td>

                    <td>
                      <span>{task.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-light"
                        onClick={() => {
                          setModal(true);
                          setSelectedTask(task);
                        }}
                      >
                        chang Status
                      </button>
                      {modal && selectedTask && (
                        <div className="modal">
                          <div className="overlay">
                            <div className="modal-content">
                              <span>
                                <h2>Task: {selectedTask.text}</h2>
                              </span>

                              <button
                                onClick={() => markComplete(selectedTask.id!)}
                                className={`btn ${
                                  selectedTask.completed
                                    ? "btn-success "
                                    : "btn-light"
                                }`}
                              >
                                done✔️
                              </button>
                              <button
                                onClick={() => hold(selectedTask.id!)}
                                className={`btn ${
                                  selectedTask.status === status[2]
                                    ? "btn-secondary "
                                    : "btn-light"
                                }`}
                              >
                                ON-HOLD
                              </button>

                              <button
                                onClick={() => deleteTask(selectedTask.id!)}
                                className={"btn btn-danger"}
                              >
                                Delete
                              </button>

                              <button
                                onClick={toggleModal}
                                className="btn btn-outline-secondary close-modal"
                              >
                                close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    {buttonSelect && (
                      <td>
                        <input
                          type="checkbox"
                          name="myCheckbox"
                          checked={allSelect.some((t) => t.id === task.id)}
                          onChange={() => handleChekbox(task)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
          {buttonSelect && allSelect.length !== 0 && (
            <div>
              <button
                className="btn btn-outline-secondary"
                onClick={() => toactive()}
              >
                {" "}
                active{" "}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => tocomplete()}
              >
                {" "}
                complete{" "}
              </button>
              <button
                className="btn btn-outline-secondary "
                onClick={() => toOnHold()}
              >
                {" "}
                on-Hold{" "}
              </button>
              <button
                className="btn btn-outline-secondary "
                onClick={() => toDelete()}
              >
                {" "}
                Delete{" "}
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

export default TodoList;
