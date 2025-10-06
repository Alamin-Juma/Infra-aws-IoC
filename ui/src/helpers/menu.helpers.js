export const isMenuActive = (item, currentPath) => {
  if (!item.children) return false;
  return item.children.some((child) => currentPath === child.path);
};

export const getInitialOpenMenus = (menuItems, currentPath) => {
  const initialOpenMenus = {};
  menuItems.forEach((item) => {
    if (item.children) {
      initialOpenMenus[item.label] = isMenuActive(item, currentPath);
    }
  });
  return initialOpenMenus;
};

export const filterMenuByRole = (menuItems, userRole) => {
  return menuItems
    .filter((item) => item.allowedRoles.includes(userRole))
    .map((item) => {
      const filteredChildren = item.children
        ? filterMenuByRole(item.children, userRole)
        : [];

      return {
        ...item,
        children: filteredChildren.length > 0 ? filteredChildren : undefined,
      };
    });
};
