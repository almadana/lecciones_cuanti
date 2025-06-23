interface LessonHeaderProps {
  title: string;
}

const LessonHeader = ({ title }: LessonHeaderProps) => {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
        {title}
      </h1>
    </header>
  );
};

export default LessonHeader; 