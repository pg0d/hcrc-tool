import './Button.css';

type ButtonProps = {
  children: any;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export function Button(props: ButtonProps) {
  return (
    <button
      type={props.type ?? 'button'}
      class={`btn ${props.variant ?? 'primary'}`}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
