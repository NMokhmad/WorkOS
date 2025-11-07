// KanbanBoard - Board Kanban pour gestion des tâches avec drag & drop
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Loader, Filter, X } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { tasksAPI, projectsAPI } from '../../services/api';

const columns = [
  { id: 'todo', title: 'À faire', color: 'bg-slate-100' },
  { id: 'inProgress', title: 'En cours', color: 'bg-blue-100' },
  { id: 'done', title: 'Terminé', color: 'bg-green-100' }
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [showProjectFilter, setShowProjectFilter] = useState(false);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        tasksAPI.getAll(),
        projectsAPI.getAll()
      ]);

      const allTasks = tasksData.tasks || [];
      setProjects(projectsData.projects || []);

      // Filtrer les tâches valides (avec un ID) et organiser par colonne
      const validTasks = allTasks.filter(t => t && t.id);

      const organized = {
        todo: validTasks.filter(t => t.status === 'todo'),
        inProgress: validTasks.filter(t => t.status === 'inProgress'),
        done: validTasks.filter(t => t.status === 'done')
      };

      setTasks(organized);
    } catch (error) {
      console.error('Error loading kanban data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les tâches par projet
  const getFilteredTasks = (columnTasks) => {
    if (!selectedProject) return columnTasks;
    return columnTasks.filter(task => task.projectId === parseInt(selectedProject));
  };

  // Drag and Drop handler
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    const taskId = parseInt(draggableId);

    // Vérifier que l'ID est valide
    if (!taskId || isNaN(taskId)) {
      console.error('Invalid task ID:', draggableId);
      return;
    }

    // Create a copy of tasks
    const newTasks = { ...tasks };
    const sourceTasks = Array.from(newTasks[sourceColumn]);
    const destTasks = sourceColumn === destColumn ? sourceTasks : Array.from(newTasks[destColumn]);

    // Remove from source
    const [movedTask] = sourceTasks.splice(source.index, 1);

    // Add to destination
    destTasks.splice(destination.index, 0, movedTask);

    // Update state optimistically
    newTasks[sourceColumn] = sourceTasks;
    newTasks[destColumn] = destTasks;
    setTasks(newTasks);

    // Update backend
    try {
      await tasksAPI.update(taskId, { status: destColumn });
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert on error
      loadData();
    }
  };

  // Timer handlers
  const handleStartTask = async (taskId) => {
    try {
      // Mise à jour optimiste de l'UI
      const newTasks = { ...tasks };
      Object.keys(newTasks).forEach(column => {
        newTasks[column] = newTasks[column].map(task => ({
          ...task,
          isRunning: task.id === taskId,
          timerStartedAt: task.id === taskId ? new Date().toISOString() : task.timerStartedAt
        }));
      });
      setTasks(newTasks);

      // Appeler la route start qui gère tout (arrêter les autres + démarrer)
      await tasksAPI.startTimer(taskId);
    } catch (error) {
      console.error('Error starting task:', error);
      // Recharger en cas d'erreur
      loadData();
    }
  };

  const handlePauseTask = async (taskId) => {
    try {
      // Mise à jour optimiste de l'UI
      const newTasks = { ...tasks };
      Object.keys(newTasks).forEach(column => {
        newTasks[column] = newTasks[column].map(task =>
          task.id === taskId ? { ...task, isRunning: false } : task
        );
      });
      setTasks(newTasks);

      // Appeler la route stop qui crée le TimeEntry et met à jour timeSpent
      const response = await tasksAPI.stopTimer(taskId);

      // Mettre à jour la tâche avec le nouveau timeSpent
      if (response.task) {
        const updatedTasks = { ...tasks };
        Object.keys(updatedTasks).forEach(column => {
          updatedTasks[column] = updatedTasks[column].map(task =>
            task.id === taskId ? { ...task, timeSpent: response.task.timeSpent } : task
          );
        });
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Error stopping task:', error);
      // Recharger en cas d'erreur
      loadData();
    }
  };

  // CRUD handlers
  const handleCreateTask = () => {
    setCurrentTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      // Vérifier si on est en mode édition (task avec ID) ou création
      const isEditMode = currentTask && currentTask.id;

      if (isEditMode) {
        // Update existing task
        await tasksAPI.update(currentTask.id, taskData);
      } else {
        // Create new task
        await tasksAPI.create(taskData);
      }
      await loadData();
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      setDeleteLoading(true);
      await tasksAPI.delete(taskToDelete.id);
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateTaskInColumn = (status) => {
    // Passer le status pour pré-remplir le formulaire
    // Mais sans ID, donc le modal saura que c'est une création
    setCurrentTask({ status });
    setIsTaskModalOpen(true);
  };

  const clearProjectFilter = () => {
    setSelectedProject('');
    setShowProjectFilter(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des tâches</h1>
          {selectedProject && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-slate-600">
                Projet: {projects.find(p => p.id === parseInt(selectedProject))?.name}
              </span>
              <button
                onClick={clearProjectFilter}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* Project Filter */}
          <div className="relative">
            <button
              onClick={() => setShowProjectFilter(!showProjectFilter)}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtrer</span>
            </button>

            {showProjectFilter && (
              <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-xl shadow-lg py-2 w-56 z-10">
                <div className="px-4 py-2 text-xs font-medium text-slate-500 uppercase">
                  Filtrer par projet
                </div>
                <button
                  onClick={() => {
                    setSelectedProject('');
                    setShowProjectFilter(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                    !selectedProject ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700'
                  }`}
                >
                  Tous les projets
                </button>
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project.id.toString());
                      setShowProjectFilter(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                      selectedProject === project.id.toString()
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-700'
                    }`}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Task Button */}
          <button
            onClick={handleCreateTask}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle tâche</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid lg:grid-cols-3 gap-6">
          {columns.map(column => {
            const columnTasks = getFilteredTasks(tasks[column.id]);

            return (
              <div key={column.id} className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${column.color.replace('100', '500')}`}></div>
                    <h2 className="font-semibold text-slate-800">{column.title}</h2>
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-medium">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-slate-100 rounded">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-96 rounded-xl p-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-slate-50' : ''
                      }`}
                    >
                      {columnTasks.filter(task => task && task.id).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'opacity-50' : ''}
                            >
                              <TaskCard
                                task={task}
                                onStart={() => handleStartTask(task.id)}
                                onPause={() => handlePauseTask(task.id)}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteClick}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Task Button */}
                <button
                  onClick={() => handleCreateTaskInColumn(column.id)}
                  className="w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors"
                >
                  <Plus className="w-5 h-5 mx-auto" />
                </button>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setCurrentTask(null);
        }}
        onSave={handleSaveTask}
        task={currentTask}
        projects={projects}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title}
        loading={deleteLoading}
      />
    </div>
  );
}
