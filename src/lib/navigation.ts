import { useRouter } from 'next/navigation';

export const useClassNavigation = () => {
  const router = useRouter();

  const goToClass = (classId: string) => {
    router.push(`/classes/${classId}`);
  };

  const goToLecture = (classId: string, lectureId: string) => {
    router.push(`/classes/${classId}/lectures/${lectureId}`);
  };

  const goToCreateClass = () => {
    router.push('/classes/create');
  };

  const goToCreateLecture = (classId: string) => {
    router.push(`/classes/${classId}/lectures/create`);
  };

  const goToPortal = () => {
    router.push('/portal');
  };

  return {
    goToClass,
    goToLecture,
    goToCreateClass,
    goToCreateLecture,
    goToPortal,
  };
};

export const getClassPath = (classId: string) => `/classes/${classId}`;
export const getLecturePath = (classId: string, lectureId: string) => `/classes/${classId}/lectures/${lectureId}`;
export const getCreateClassPath = () => '/classes/create';
export const getCreateLecturePath = (classId: string) => `/classes/${classId}/lectures/create`; 