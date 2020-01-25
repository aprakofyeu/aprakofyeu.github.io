using System.Security.Cryptography;
using System.Text;

namespace VkApp.Web.Infrastructure
{
    public static class HashCalculator
    {
        private static readonly ASCIIEncoding AsciiEncoding = new ASCIIEncoding();

        public static string Calculate(string password)
        {
            var data = Encoding.ASCII.GetBytes(password);
            var sha1Data = new SHA1CryptoServiceProvider().ComputeHash(data);
            return AsciiEncoding.GetString(sha1Data);
        }
    }
}