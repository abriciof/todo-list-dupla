from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import psycopg2
import os

load_dotenv()

app = FastAPI()

origins = [
    "http://frontend:3001",
    "http://localhost:3001",
    "http://localhost",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL1 = os.environ.get('DATABASE_URL1')
DATABASE_URL2 = os.environ.get('DATABASE_URL2')

def get_db_connection(db_url):
    conn = psycopg2.connect(db_url)
    return conn

class Task(BaseModel):
    task: str
    todo_id: str

@app.get("/tasks")
def get_tasks():

    tasks = {"todo_1": [], "todo_2": []}
    try:
        with get_db_connection(DATABASE_URL1) as conn1, get_db_connection(DATABASE_URL2) as conn2:
            with conn1.cursor() as cur1, conn2.cursor() as cur2:
                cur1.execute("SELECT id, task, 'todo_1' as listId FROM tasks")
                tasks_todo_1 = cur1.fetchall()
                cur2.execute("SELECT id, task, 'todo_2' as listId FROM tasks")
                tasks_todo_2 = cur2.fetchall()

        if not tasks_todo_1 is None:
            tasks["todo_1"] = [{"id": task[0], "task": task[1], "todo_id": task[2]} for task in tasks_todo_1]

        if not tasks_todo_2 is None:
            tasks["todo_2"] = [{"id": task[0], "task": task[1], "todo_id": task[2]} for task in tasks_todo_2]

    except Exception as e:
        return JSONResponse({"message": str(e)}, status_code=404)
    
    else:
        return tasks



@app.post("/tasks")
def add_task(task: Task):

    db_url = DATABASE_URL1 if task.todo_id == 'todo_1' else DATABASE_URL2

    try:
        with get_db_connection(db_url) as conn:
            with conn.cursor() as cur:
                cur.execute(f"INSERT INTO tasks (task) VALUES (%s) RETURNING id, task, %s", (task.task, task.todo_id))
                conn.commit()
                new_task = cur.fetchone()
    except Exception as e:
        return JSONResponse({"message": str(e)}, status_code=404)
    
    else:
        return JSONResponse({"id": new_task[0], "task": new_task[1], "todo_id": new_task[2]}, status_code=200)



@app.delete("/tasks/{todo_id}/{task_id}")
def delete_task(todo_id: str, task_id: int):

    db_url = DATABASE_URL1 if todo_id == 'todo_1' else DATABASE_URL2

    try:
        with get_db_connection(db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM tasks WHERE id = %s RETURNING id", (task_id,))
                deleted = cur.fetchone()
                if deleted is None:
                    raise HTTPException(status_code=404, detail="Tarefa não encontrada")
                conn.commit()

    except Exception as e:
        return JSONResponse({"message": str(e)}, status_code=404)
    
    else:
        return {"message": f"Tarefa '{deleted[0]}' deletada"}
