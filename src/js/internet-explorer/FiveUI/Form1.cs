using System.Windows.Forms;

namespace FiveUI
{
    public partial class HighlighterOptionsForm : Form
    {
        public HighlighterOptionsForm()
        {
            InitializeComponent();
        }

        public string InputText
        {
            get { return this.textBox1.Text; }
            set { this.textBox1.Text = value; }
        }
    }
}