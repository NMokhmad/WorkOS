// Utilitaires pour l'export de données

/**
 * Convertit un tableau d'objets en CSV
 */
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';

  // En-têtes
  const headerRow = headers.join(',');

  // Lignes de données
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      // Échapper les virgules et guillemets
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
};

/**
 * Télécharge un fichier CSV
 */
export const downloadCSV = (data, headers, filename) => {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Télécharge un fichier JSON
 */
export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Formate les tâches pour l'export
 */
export const formatTasksForExport = (tasks) => {
  return tasks.map(task => ({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority || '',
    project: task.project?.name || 'Sans projet',
    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '',
    timeSpent: formatTime(task.timeSpent || 0),
    createdAt: new Date(task.createdAt).toLocaleDateString('fr-FR'),
    updatedAt: new Date(task.updatedAt).toLocaleDateString('fr-FR')
  }));
};

/**
 * Formate les projets pour l'export
 */
export const formatProjectsForExport = (projects) => {
  return projects.map(project => ({
    name: project.name,
    description: project.description || '',
    status: project.status,
    color: project.color,
    startDate: project.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR') : '',
    endDate: project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR') : '',
    totalTasks: project.totalTasks || 0,
    completedTasks: project.completedTasks || 0,
    totalTimeSpent: formatTime(project.totalTimeSpent || 0),
    createdAt: new Date(project.createdAt).toLocaleDateString('fr-FR')
  }));
};

/**
 * Formate les entrées de temps pour l'export
 */
export const formatTimeEntriesForExport = (entries) => {
  return entries.map(entry => ({
    task: entry.task?.title || 'Sans tâche',
    project: entry.task?.project?.name || 'Sans projet',
    duration: formatTime(entry.durationSeconds),
    startedAt: new Date(entry.startedAt).toLocaleString('fr-FR'),
    endedAt: entry.endedAt ? new Date(entry.endedAt).toLocaleString('fr-FR') : 'En cours',
    date: new Date(entry.startedAt).toLocaleDateString('fr-FR')
  }));
};

/**
 * Formate un nombre de secondes en heures et minutes
 */
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
