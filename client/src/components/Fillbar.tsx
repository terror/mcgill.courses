type FillbarProps = {
  fillAmount: number;
  width?: number;
  height?: number;
};

export const Fillbar = ({ fillAmount, width, height }: FillbarProps) => {
  return (
    <div
      className='bg-gray-200 rounded-xl'
      style={{ width: width ?? 48, height: height ?? 4 }}
    >
      <div
        className={'bg-red-500 rounded-xl'}
        style={{ width: `${fillAmount}%`, height: height ?? 4 }}
      />
    </div>
  );
};
