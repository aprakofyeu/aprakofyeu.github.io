using System.Security.Cryptography;
using System.Text;

namespace VkApp.Web.Infrastructure
{
    public static class HashCalculator
    {
        private static readonly SHA1CryptoServiceProvider Sha1 = new SHA1CryptoServiceProvider();
        private static readonly ASCIIEncoding AsciiEncoding = new ASCIIEncoding();

        public static string Calculate(string password)
        {
            var data = Encoding.ASCII.GetBytes(password);
            var sha1Data = Sha1.ComputeHash(data);
            return AsciiEncoding.GetString(sha1Data);
        }
    }
}