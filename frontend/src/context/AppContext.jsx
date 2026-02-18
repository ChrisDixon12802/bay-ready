import React, { createContext, useState, useEffect, useContext } from "react";

export const AppContext = createContext();

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export function AppProvider({ children }) {
  // Initialize shop info from localStorage
  const [shopInfo, setShopInfo] = useState(() => {
    const saved = localStorage.getItem("bayReadyShopInfo");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      shopName: "",
      shopLocation: "",
      managerName: "",
      shopPhone: "",
    };
  });

  // Initialize settings from localStorage if available, otherwise use defaults
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("bayReadySettings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      voiceEnabled: true,
      wakeWord: "Bay Ready",
    };
  });

  const [timeSavedToday, setTimeSavedToday] = useState(() => {
    const saved = localStorage.getItem("bayReadyData");
    if (saved) {
      const data = JSON.parse(saved);
      return data.timeSavedToday || 0;
    }
    return 0;
  });

  const [openingProgress, setOpeningProgress] = useState(() => {
    const saved = localStorage.getItem("bayReadyData");
    if (saved) {
      const data = JSON.parse(saved);
      return data.openingProgress || 0;
    }
    return 0;
  });

  const [closingProgress, setClosingProgress] = useState(() => {
    const saved = localStorage.getItem("bayReadyData");
    if (saved) {
      const data = JSON.parse(saved);
      return data.closingProgress || 0;
    }
    return 0;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("bayReadyTeam");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const [customRoles, setCustomRoles] = useState(() => {
    const saved = localStorage.getItem("bayReadyRoles");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const canDeleteContent = () => {
    try {
      const savedUser = localStorage.getItem("bayReadyUser");
      const currentUser = savedUser ? JSON.parse(savedUser) : null;
      const creatorEmail = localStorage.getItem("bayReadyCreatorEmail");

      const userEmail = (currentUser?.email || "").toLowerCase().trim();
      const isCreator =
        !!creatorEmail && userEmail === creatorEmail.toLowerCase().trim();
      const userRole = (currentUser?.role || "").toLowerCase().trim();
      const isManagerByRole = userRole.includes("manager");

      return isCreator || isManagerByRole;
    } catch {
      return false;
    }
  };

  const addRole = (newRole) => {
    const roleExists = customRoles.some((r) => r.name === newRole.name);
    if (!roleExists) {
      setCustomRoles((prev) => [...prev, newRole]);
    }
  };

  const deleteRole = (roleName) => {
    setCustomRoles((prev) => prev.filter((r) => r.name !== roleName));
  };

  const getRoleConfig = (roleName) => {
    return (
      customRoles.find((r) => r.name === roleName) || {
        color: "bg-gray-100 text-gray-800",
        icon: "👤",
        border: "border-gray-300",
      }
    );
  };

  const addEmployee = (employee) => {
    setEmployees((prev) => {
      const maxId = prev.length > 0 ? Math.max(...prev.map((e) => e.id), 0) : 0;
      const newEmployee = {
        id: maxId + 1,
        name: employee.name,
        role: employee.role || "Tech",
        status: "Active",
      };
      return [...prev, newEmployee];
    });
  };

  const deleteEmployee = (employeeId) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("bayReadyData");
    if (saved) {
      const data = JSON.parse(saved);
      return data.tasks || [];
    }
    return [];
  });

  const [checklists, setChecklists] = useState(() => {
    const saved = localStorage.getItem("bayReadyData");
    if (saved) {
      const data = JSON.parse(saved);
      return data.checklists || { opening: [], mid: [], closing: [] };
    }
    return { opening: [], mid: [], closing: [] };
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("bayReadyData");
    if (saved) {
      const data = JSON.parse(saved);
      return data.orders || [];
    }
    return [];
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("bayReadySettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Auto-reset time saved if it's a new day
  useEffect(() => {
    const saved = localStorage.getItem("bayReadyData");
    if (saved) {
      const data = JSON.parse(saved);
      const lastDate = data.lastDate;
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      if (lastDate && lastDate !== today) {
        const archivedDailyData = {
          timeSavedToday: data.timeSavedToday || 0,
          openingProgress: data.openingProgress || 0,
          closingProgress: data.closingProgress || 0,
        };
        localStorage.setItem(
          `bayReadyData_${lastDate}`,
          JSON.stringify(archivedDailyData),
        );

        // New day detected, reset time saved
        setTimeSavedToday(0);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      tasks,
      checklists,
      orders,
      timeSavedToday,
      openingProgress,
      closingProgress,
      lastDate: new Date().toISOString().split("T")[0], // Store today's date
    };
    localStorage.setItem("bayReadyData", JSON.stringify(dataToSave));
  }, [
    tasks,
    checklists,
    orders,
    timeSavedToday,
    openingProgress,
    closingProgress,
  ]);

  useEffect(() => {
    localStorage.setItem("bayReadySettings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("bayReadyTeam", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("bayReadyRoles", JSON.stringify(customRoles));
  }, [customRoles]);

  useEffect(() => {
    const openingTotal = checklists.opening.length;
    if (openingTotal > 0) {
      const openingCompleted = checklists.opening.filter(
        (item) => item.completed,
      ).length;
      setOpeningProgress(Math.round((openingCompleted / openingTotal) * 100));
    } else {
      setOpeningProgress(0);
    }

    const closingTotal = checklists.closing.length;
    if (closingTotal > 0) {
      const closingCompleted = checklists.closing.filter(
        (item) => item.completed,
      ).length;
      setClosingProgress(Math.round((closingCompleted / closingTotal) * 100));
    } else {
      setClosingProgress(0);
    }
  }, [checklists]);

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          if (newCompleted) {
            setTimeSavedToday((prevTime) => prevTime + 3);
          } else {
            setTimeSavedToday((prevTime) => Math.max(0, prevTime - 3));
          }
          return { ...task, completed: newCompleted };
        }
        return task;
      }),
    );
  };

  const addTask = (newTask) => {
    const task = {
      id: tasks.length + 1,
      title: newTask.title || "New task",
      assignee: newTask.assignee || "Unassigned",
      priority: newTask.priority || "low",
      dueTime: newTask.dueTime || "5:00 PM",
      completed: false,
    };
    setTasks((prev) => [...prev, task]);
  };

  const deleteTask = (taskId) => {
    if (!canDeleteContent()) {
      return;
    }
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const toggleChecklistItem = (category, itemId) => {
    setChecklists((prev) => ({
      ...prev,
      [category]: prev[category].map((item) => {
        if (item.id === itemId) {
          const newCompleted = !item.completed;
          if (newCompleted) {
            setTimeSavedToday((prevTime) => prevTime + 2);
          } else {
            setTimeSavedToday((prevTime) => Math.max(0, prevTime - 2));
          }
          return { ...item, completed: newCompleted };
        }
        return item;
      }),
    }));
  };

  const toggleChecklistTask = (category, taskId) => {
    toggleChecklistItem(category, taskId);
  };

  const markChecklistComplete = (category) => {
    setChecklists((prev) => ({
      ...prev,
      [category]: prev[category].map((item) => ({ ...item, completed: true })),
    }));
  };

  const addChecklistTask = (category, taskName, required = false) => {
    setChecklists((prev) => ({
      ...prev,
      [category]: [
        ...prev[category],
        {
          id: prev[category].length + 1,
          task: taskName,
          completed: false,
          required: required,
        },
      ],
    }));
  };

  const deleteChecklistTask = (category, taskId) => {
    if (!canDeleteContent()) {
      return;
    }
    setChecklists((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== taskId),
    }));
  };

  const toggleOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const newCompleted = !order.completed;
          if (newCompleted) {
            setTimeSavedToday((prevTime) => prevTime + 5);
          } else {
            setTimeSavedToday((prevTime) => Math.max(0, prevTime - 5));
          }
          return { ...order, completed: newCompleted };
        }
        return order;
      }),
    );
  };

  const addOrder = (newOrder) => {
    const order = {
      id: orders.length + 1,
      item: newOrder.item || "New item",
      vendor: newOrder.vendor || "Unknown",
      frequency: newOrder.frequency || "Weekly",
      dueDate: newOrder.dueDate || "TBD",
      completed: false,
      emergency: newOrder.emergency || false,
    };
    setOrders((prev) => [...prev, order]);
  };

  const deleteOrder = (orderId) => {
    if (!canDeleteContent()) {
      return;
    }
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  const resetTimeSaved = () => {
    setTimeSavedToday(0);
    // Clear all analytics data from localStorage
    localStorage.removeItem("bayReadyData");
    const allKeys = Object.keys(localStorage);
    const keysToRemove = allKeys.filter(
      (key) => key.startsWith("bayReadyData_") || key === "bayReadyAnalytics",
    );
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  };

  const value = {
    tasks,
    setTasks,
    toggleTask,
    addTask,
    deleteTask,
    checklists,
    setChecklists,
    toggleChecklistItem,
    toggleChecklistTask,
    markChecklistComplete,
    addChecklistTask,
    deleteChecklistTask,
    orders,
    setOrders,
    toggleOrder,
    addOrder,
    deleteOrder,
    canDeleteContent,
    timeSavedToday,
    setTimeSavedToday,
    resetTimeSaved,
    openingProgress,
    setOpeningProgress,
    closingProgress,
    setClosingProgress,
    settings,
    setSettings,
    updateSettings,
    employees,
    setEmployees,
    addEmployee,
    deleteEmployee,
    customRoles,
    setCustomRoles,
    addRole,
    deleteRole,
    getRoleConfig,
    shopInfo,
    setShopInfo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
