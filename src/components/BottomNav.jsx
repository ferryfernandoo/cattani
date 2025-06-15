import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  ShoppingBagIcon as ShoppingSolid,
  DocumentTextIcon as DocumentSolid,
  ChartBarIcon as ChartSolid,
  UserIcon as UserSolid,
} from '@heroicons/react/24/solid';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon, activeIcon: HomeSolid },
    { path: '/pasar', label: 'Pasar', icon: ShoppingBagIcon, activeIcon: ShoppingSolid },
    { path: '/catatan', label: 'Catatan', icon: DocumentTextIcon, activeIcon: DocumentSolid },
    { path: '/monitor', label: 'Monitor', icon: ChartBarIcon, activeIcon: ChartSolid },
    { path: '/profil', label: 'Profil', icon: UserIcon, activeIcon: UserSolid },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe pointer-events-auto">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0.9,
                  color: isActive ? '#059669' : '#6B7280',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="flex flex-col items-center"
              >
                {isActive && (
                  <motion.div
                    layoutId="bubble"
                    className="absolute -top-1 w-1 h-1 bg-emerald-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  />
                )}
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1" style={{ color: isActive ? '#059669' : '#6B7280' }}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
